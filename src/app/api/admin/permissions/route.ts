import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@/shared/enums';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const body = await request.json();
    const { targetUserId, categoryId, canUpload, canDelete } = body;

    // 1. Validate Input
    if (!targetUserId || !categoryId) {
      return new NextResponse('User ID and Category ID are required', { status: 400 });
    }

    // 2. Security Check: Who is trying to grant access?
    const requesterRole = session.user.role;
    const requesterDept = session.user.departmentId;

    if (requesterRole !== UserRole.MasterAdmin && requesterRole !== UserRole.DeptAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // 3. Dept Admin Specific Checks
    if (requesterRole === UserRole.DeptAdmin) {
      // A. Check if the Category belongs to their department
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category || category.departmentId !== requesterDept) {
        return new NextResponse('You cannot grant access to categories outside your department', { status: 403 });
      }

      // B. Check if the Target User belongs to their department (Optional, but good practice)
      const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
      if (!targetUser || targetUser.departmentId !== requesterDept) {
        return new NextResponse('You cannot manage users outside your department', { status: 403 });
      }
    }

    // 4. Grant/Update Access (Upsert)
    // If access exists, update permissions. If not, create it.
    const access = await prisma.userCategoryAccess.upsert({
      where: {
        userId_categoryId: {
          userId: targetUserId,
          categoryId: categoryId
        }
      },
      update: {
        canUpload: canUpload ?? false,
        canDelete: canDelete ?? false,
      },
      create: {
        userId: targetUserId,
        categoryId: categoryId,
        canUpload: canUpload ?? false,
        canDelete: canDelete ?? false,
      }
    });

    return NextResponse.json(access);

  } catch (error) {
    console.error('Error granting permissions:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// Optional: DELETE to Revoke Access
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');
    const categoryId = searchParams.get('categoryId');

    if (!targetUserId || !categoryId) return new NextResponse('Missing params', { status: 400 });

    // (Add similar Security Checks here as POST...)

    await prisma.userCategoryAccess.delete({
      where: {
        userId_categoryId: {
          userId: targetUserId,
          categoryId: categoryId
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}