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
  departmentId?: string; // For Master Admin filtering
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

    // 1. APPLY FILTERS (If provided)
    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    // 2. APPLY RBAC SCOPE
    if (user.role === UserRole.MasterAdmin) {
      // Master Admin sees ALL.
      // Optional: Filter by specific department if requested
      if (filters?.departmentId) {
        where.category = { departmentId: filters.departmentId };
      }
    }
    else if (user.role === UserRole.DeptAdmin) {
      // Dept Admin sees:
      // A. Any categories in other departments they were explicitly granted access to
      // B. Everything in their own Department (if they have one assigned)
      
      const adminConditions: Prisma.DocumentWhereInput[] = [
         { category: { accessList: { some: { userId: user.id } } } }
      ];

      // FIX: Only add the department filter if the ID is a valid string
      if (user.departmentId) {
        adminConditions.push({ category: { departmentId: user.departmentId } });
      }

      where.OR = adminConditions;
    }
    else {
      // Dept User & View Only:
      // See ONLY categories they are explicitly assigned to
      where.category = {
        accessList: {
          some: { userId: user.id }
        }
      };
    }

    // Execute Query
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

    // Fetch Stats (keeping your existing pattern)
    const statsArray = await Promise.all(
      docs.map((d) =>
        statsService.getQuickStatsForDocument(d.documentId),
      ),
    );

    // Map to Response
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

  /**
   * Creates a new document record.
   */
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

  /**
   * Fetches a single document by its ID.
   * NOTE: This needs security checks in the Controller/Route before returning!
   */
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

  /**
   * Updates a document's file name.
   */
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

  /**
   * Deletes a document and its file from storage.
   */
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
   * Generates a signed URL.
   */
  async getSignedUrl(
    filePath: string,
  ): Promise<string> {
    return storageService.generateSignedUrl(
      filePath,
      SIGNED_URL_TTL,
      STORAGE_BUCKET,
    );
  },

  /**
   * Validates file type and size.
   */
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
    const limit = maxFileSizeMb ?? 10; // Default 10MB if not set

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