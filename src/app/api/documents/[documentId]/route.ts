import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

import {
  createErrorResponse,
  documentService,
  storageService,
} from '@/services';

import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@/shared/enums';
import { ActivityType } from '@prisma/client';

/**
 * GET /api/documents/[documentId]
 * Returns document metadata (DO NOT open file here)
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return createErrorResponse('Unauthorized', 401);

    const { documentId } = params;
    const user = session.user;

    const doc = await prisma.document.findUnique({
      where: { documentId },
      include: { category: true },
    });

    if (!doc) return createErrorResponse('Document not found', 404);

    let canView = false;

    if (user.role === UserRole.MasterAdmin) canView = true;
    else if (user.role === UserRole.DeptAdmin) {
      if (doc.category?.departmentId === user.departmentId) canView = true;
      else if (doc.categoryId) {
        const access = await prisma.userCategoryAccess.findUnique({
          where: {
            userId_categoryId: {
              userId: user.id,
              categoryId: doc.categoryId,
            },
          },
        });
        if (access) canView = true;
      }
    } else if (doc.userId === user.id) {
      canView = true;
    } else if (doc.categoryId) {
      const access = await prisma.userCategoryAccess.findUnique({
        where: {
          userId_categoryId: {
            userId: user.id,
            categoryId: doc.categoryId,
          },
        },
      });
      if (access) canView = true;
    }

    if (!canView) return createErrorResponse('Access Denied', 403);

    const docData = await documentService.getDocumentById(documentId);
    return NextResponse.json({ document: docData });

  } catch (error) {
    return createErrorResponse('Server error', 500, error);
  }
}

/**
 * DELETE /api/documents/[documentId]
 * Deletes document
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return createErrorResponse('Unauthorized', 401);

    const { documentId } = params;
    const user = session.user;

    const doc = await prisma.document.findUnique({
      where: { documentId },
      include: { category: true },
    });

    if (!doc) return createErrorResponse('Document not found', 404);

    let canDelete = false;

    if (user.role === UserRole.MasterAdmin) canDelete = true;
    else if (user.role === UserRole.DeptAdmin) {
      if (doc.category?.departmentId === user.departmentId) canDelete = true;
    } else if (user.role === UserRole.DeptUser && doc.categoryId) {
      const access = await prisma.userCategoryAccess.findUnique({
        where: {
          userId_categoryId: {
            userId: user.id,
            categoryId: doc.categoryId,
          },
        },
      });
      if (access?.canDelete) canDelete = true;
    }

    if (!canDelete) {
      return createErrorResponse(
        'You do not have permission to delete this file',
        403,
      );
    }

    await documentService.deleteDocument(documentId);

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: ActivityType.DELETE_FILE,
        details: `Deleted file "${doc.fileName}"`,
        metadata: { documentId: doc.documentId, categoryId: doc.categoryId },
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    return createErrorResponse('Server error', 500, error);
  }
}
