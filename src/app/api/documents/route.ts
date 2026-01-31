import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { createErrorResponse, documentService, storageService } from '@/services';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@/shared/enums';
import prisma from '@/lib/prisma';
import { ActivityType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId') ?? undefined;
    const departmentId = searchParams.get('departmentId') ?? undefined;

    // Pass the full user context (role, departmentId) to the service
    const documents = await documentService.getUserDocuments(
      session.user,
      {
        categoryId,
        departmentId
      }
    );

    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    return createErrorResponse(
      'Server error while fetching documents',
      500,
      error,
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 401);
    }

    const user = session.user;

    // Parse Form Data
    const formData = await req.formData();
    const file = formData.get('file');
    const categoryId = formData.get('categoryId') as string;

    if (!(file instanceof File) || !file.name) {
      return createErrorResponse('Invalid file type or missing file', 400);
    }

    if (!categoryId) {
      return createErrorResponse('Category ID is required', 400);
    }

    // ==========================================================
    // PERMISSION CHECK: Can this user upload to this category?
    // ==========================================================
    let canUpload = false;

    // 1. Master Admin: Yes
    if (user.role === UserRole.MasterAdmin) {
      canUpload = true;
    }
    // 2. Dept Admin: Yes, if category is in their department (or they have special access)
    else if (user.role === UserRole.DeptAdmin) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (category && category.departmentId === user.departmentId) {
        canUpload = true;
      } else {
        // Check for cross-department permissions
        const access = await prisma.userCategoryAccess.findUnique({
          where: { userId_categoryId: { userId: user.id, categoryId } }
        });
        if (access?.canUpload) canUpload = true;
      }
    }
    // 3. Dept User: Yes, if explicitly granted 'canUpload'
    else if (user.role === UserRole.DeptUser) {
      const access = await prisma.userCategoryAccess.findUnique({
        where: { userId_categoryId: { userId: user.id, categoryId } }
      });
      if (access?.canUpload) canUpload = true;
    }
    // 4. View Only: No (default false)

    if (!canUpload) {
      return createErrorResponse('You do not have permission to upload to this category', 403);
    }

    // ==========================================================
    // PROCESS UPLOAD
    // ==========================================================

    await documentService.validateUploadFile(file);

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await storageService.uploadFile(buffer, {
      userId: user.id,
      fileName: file.name,
      fileType: file.type,
    });

    if (!uploadResult) {
      return createErrorResponse('File upload failed', 500);
    }

    const document = await documentService.createDocument({
      userId: user.id,
      fileName: file.name,
      filePath: uploadResult,
      fileType: file.type,
      size: file.size,
      categoryId: categoryId,
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: ActivityType.UPLOAD_FILE,
        details: `Uploaded file "${file.name}"`,
        metadata: { documentId: document.documentId, categoryId }
      }
    });

    return NextResponse.json({ document }, { status: 200 });
  } catch (error) {
    return createErrorResponse(
      'Server error while uploading document',
      500,
      error,
    );
  }
}