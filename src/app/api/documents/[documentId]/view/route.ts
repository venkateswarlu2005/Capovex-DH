import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

import { authOptions } from '@/lib/authOptions';
import { createErrorResponse, storageService } from '@/services';
import { UserRole } from '@/shared/enums';

export async function GET(
  _req: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return createErrorResponse('Unauthorized', 401);

    const user = session.user;
    const { documentId } = params;

    const doc = await prisma.document.findUnique({
      where: { documentId },
      include: { category: true },
    });

    if (!doc) return createErrorResponse('Document not found', 404);

    let canView = false;

    if (user.role === UserRole.MasterAdmin) canView = true;
    else if (user.role === UserRole.DeptAdmin) {
      if (doc.category?.departmentId === user.departmentId) canView = true;
    } else if (doc.userId === user.id) canView = true;
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

    if (!canView) return createErrorResponse('Access Denied', 403);

    // 🔑 Resolve & redirect
    const viewUrl = await storageService.generateSignedUrl(doc.filePath);
    return NextResponse.redirect(viewUrl);

  } catch (error) {
    return createErrorResponse('Failed to open document', 500, error);
  }
}
