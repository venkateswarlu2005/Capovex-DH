import prisma from '@/lib/prisma';
import {
  ServiceError,
  statsService,
  storageService,
  systemSettingService,
} from '@/services';

import {
  SIGNED_URL_TTL,
  STORAGE_BUCKET,
} from '@/shared/config/storageConfig';
import { UserRole } from '@/shared/enums';
import { Prisma } from '@prisma/client';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type UserContext = {
  id: string;
  role: UserRole;
  departmentId?: string | null;
};

type GetDocumentsFilters = {
  categoryId?: string;
  departmentId?: string;
};

/* -------------------------------------------------------------------------- */
/* Document Service                                                          */
/* -------------------------------------------------------------------------- */

export const documentService = {
  /**
   * Retrieves documents based on RBAC hierarchy.
   */
  async getUserDocuments(
    user: UserContext,
    filters?: GetDocumentsFilters,
  ) {
    const where: Prisma.DocumentWhereInput = {};

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (user.role === UserRole.MasterAdmin) {
      if (filters?.departmentId) {
        where.category = { departmentId: filters.departmentId };
      }
    }
    else if (user.role === UserRole.DeptAdmin) {
      const adminConditions: Prisma.DocumentWhereInput[] = [
         { category: { accessList: { some: { userId: user.id } } } }
      ];

      if (user.departmentId) {
        adminConditions.push({ category: { departmentId: user.departmentId } });
      }

      where.OR = adminConditions;
    }
    else {
      where.category = {
        accessList: {
          some: { userId: user.id }
        }
      };
    }

    const docs = await prisma.document.findMany({
      where,
      select: {
        documentId: true,
        fileName: true,
        filePath: true,
        fileType: true,
        size: true,
        createdAt: true,
        updatedAt: true,
        categoryId: true,
        category: {
          select: { name: true, department: { select: { name: true } } }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const statsArray = await Promise.all(
      docs.map((d) =>
        statsService.getQuickStatsForDocument(d.documentId),
      ),
    );

    return docs.map((doc, idx) => ({
      documentId: doc.documentId,
      fileName: doc.fileName,
      filePath: doc.filePath,
      fileType: doc.fileType,
      size: doc.size,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      categoryName: doc.category?.name || 'Uncategorized',
      departmentName: doc.category?.department?.name || 'General',
      uploader: {
        name: `${doc.user.firstName} ${doc.user.lastName}`,
        avatar: null,
      },
      stats: statsArray[idx],
    }));
  },

  async createDocument({
    userId,
    fileName,
    filePath,
    fileType,
    size,
    categoryId,
  }: {
    userId: string;
    fileName: string;
    filePath: string;
    fileType: string;
    size: number;
    categoryId?: string;
  }) {
    return prisma.document.create({
      data: {
        userId,
        fileName,
        filePath,
        fileType,
        size,
        categoryId,
      },
    });
  },

  async getDocumentById(documentId: string) {
    const doc = await prisma.document.findUnique({
      where: { documentId },
      include: {
        user: { select: { firstName: true, lastName: true } },
        category: true,
      }
    });

    if (!doc) return null;

    const stats = await statsService.getQuickStatsForDocument(documentId);

    return {
      ...doc,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      uploader: {
        name: `${doc.user.firstName} ${doc.user.lastName}`,
      },
      stats,
    };
  },

  async updateDocument(
    documentId: string,
    data: { fileName?: string },
  ) {
    return prisma.document.update({
      where: { documentId },
      data: {
        fileName: data.fileName,
      },
    });
  },

  async deleteDocument(documentId: string) {
    const document = await prisma.document.findUnique({
      where: { documentId },
    });

    if (!document) return null;

    const deletedDoc = await prisma.document.delete({
      where: { documentId },
    });

    await storageService.deleteFile(deletedDoc.filePath);

    return deletedDoc;
  },

  /**
   * Generates a signed URL if the user has permission to view the document.
   * Checks: Owner OR Access List OR Admin Roles.
   */
  async getAuthorizedSignedUrl(userId: string, documentId: string): Promise<string> {
    // 1. Fetch document with Category and Access List info
    const doc = await prisma.document.findUnique({
      where: { documentId },
      include: {
        category: {
          include: {
            accessList: {
              where: { userId }, // Check if THIS user is in the access list
            }
          }
        },
      }
    });

    if (!doc) {
      throw new ServiceError('Document not found', 404);
    }

    // 2. Check: Is user the Owner?
    if (doc.userId === userId) {
      return this.getSignedUrl(doc.filePath);
    }

    // 3. Check: Is user in the Category Access List?
    // If the 'where' clause in the include found anything, the array will have items.
    if (doc.category?.accessList && doc.category.accessList.length > 0) {
      return this.getSignedUrl(doc.filePath);
    }

    // 4. Fallback: Check for Admin Roles (Master or Dept Admin)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, departmentId: true }
    });

    if (!user) throw new ServiceError('User not found', 401);

    // Master Admin can see everything
    if (user.role === UserRole.MasterAdmin) {
      return this.getSignedUrl(doc.filePath);
    }

    // Dept Admin can see everything in their department
    if (user.role === UserRole.DeptAdmin) {
      if (doc.category?.departmentId === user.departmentId) {
        return this.getSignedUrl(doc.filePath);
      }
    }

    // If all checks fail
    throw new ServiceError('Access denied. You do not have permission to view this document.', 403);
  },

  async getSignedUrl(
    filePath: string,
  ): Promise<string> {
    return storageService.generateSignedUrl(
      filePath,
      SIGNED_URL_TTL,
      STORAGE_BUCKET,
    );
  },

  async validateUploadFile(file: File) {
    const { maxFileSizeMb, allowedMimeTypes } =
      await systemSettingService.getUploadLimits();

    const whitelist = (allowedMimeTypes ?? []).filter(Boolean);

    if (whitelist.length && !whitelist.includes(file.type)) {
      throw new ServiceError(
        `INVALID_FILE_TYPE: ${file.type} is not allowed`,
        400,
      );
    }

    const fileSizeMB = file.size / (1024 * 1024);
    const limit = maxFileSizeMb ?? 10; 

    if (fileSizeMB > limit) {
      throw new ServiceError(
        `FILE_TOO_LARGE: ${fileSizeMB.toFixed(
          2,
        )}MB exceeds limit of ${limit}MB`,
        413,
      );
    }
  },
};