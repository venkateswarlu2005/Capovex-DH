import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { createErrorResponse, documentService, storageService } from '@/services';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@/shared/enums';
import { ActivityType } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return createErrorResponse('Unauthorized', 401);

    const { documentId } = params;
    const user = session.user;

    // 1. Fetch Document Metadata
    const doc = await prisma.document.findUnique({
      where: { documentId },
      include: { category: true }
    });

    if (!doc) return createErrorResponse('Document not found', 404);

    // 2. PERMISSION CHECK: Can I view this?
    let canView = false;

    // A. Master Admin: Always Yes
    if (user.role === UserRole.MasterAdmin) canView = true;

    // B. Dept Admin: Yes if in same department
    else if (user.role === UserRole.DeptAdmin) {
      if (doc.category?.departmentId === user.departmentId) canView = true;
      // Or if they have explicit cross-dept access
      else {
         const access = await prisma.userCategoryAccess.findUnique({
            where: { userId_categoryId: { userId: user.id, categoryId: doc.categoryId! } }
         });
         if (access) canView = true;
      }
    }

    // C. Owner: Always Yes (Fallback)
    else if (doc.userId === user.id) canView = true;

    // D. Standard Access Check (Dept User / View Only)
    else {
      if (doc.categoryId) {
        const access = await prisma.userCategoryAccess.findUnique({
          where: { userId_categoryId: { userId: user.id, categoryId: doc.categoryId } }
        });
        if (access) canView = true;
      }
    }

    if (!canView) return createErrorResponse('Access Denied', 403);

    // 3. Return Data
    // We use the service to format the response nicely (stats, uploader info, etc.)
    const docData = await documentService.getDocumentById(documentId);
    return NextResponse.json({ document: docData });

  } catch (error) {
    return createErrorResponse('Server error', 500, error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return createErrorResponse('Unauthorized', 401);

    const { documentId } = params;
    const user = session.user;

    // 1. Fetch Document to check Category
    const doc = await prisma.document.findUnique({
      where: { documentId },
      include: { category: true }
    });

    if (!doc) return createErrorResponse('Document not found', 404);

    // 2. PERMISSION CHECK: Can I delete this?
    let canDelete = false;

    // A. Master Admin: Yes
    if (user.role === UserRole.MasterAdmin) canDelete = true;

    // B. Dept Admin: Yes (if in their dept)
    else if (user.role === UserRole.DeptAdmin) {
      if (doc.category?.departmentId === user.departmentId) canDelete = true;
    }

    // C. Dept User: Yes (ONLY if they have 'canDelete' permission)
    // Note: Being the "owner" is not enough in strict RBAC if 'canDelete' is false,
    // but usually owners can delete their own files. Let's enforce strict RBAC here.
    else if (user.role === UserRole.DeptUser) {
      if (doc.categoryId) {
        const access = await prisma.userCategoryAccess.findUnique({
          where: { userId_categoryId: { userId: user.id, categoryId: doc.categoryId } }
        });
        if (access?.canDelete) canDelete = true;
      }
    }

    if (!canDelete) {
      return createErrorResponse('You do not have permission to delete this file', 403);
    }

    // 3. Perform Delete
    await documentService.deleteDocument(documentId);

    // 4. Log Activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: ActivityType.DELETE_FILE,
        details: `Deleted file "${doc.fileName}"`,
        metadata: { documentId: doc.documentId, categoryId: doc.categoryId }
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    return createErrorResponse('Server error', 500, error);
  }
}