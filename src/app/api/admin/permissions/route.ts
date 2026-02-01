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

    if (!targetUserId || !categoryId) {
      return new NextResponse('User ID and Category ID are required', { status: 400 });
    }

    const requester = session.user;

    // 1. Fetch Target User to check their Role & Department
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser) return new NextResponse('Target user not found', { status: 404 });

    // 2. Fetch Category to check its Department
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) return new NextResponse('Category not found', { status: 404 });


    // ============================================================
    // RULE 1: MASTER ADMIN LOGIC
    // ============================================================
    if (requester.role === UserRole.MasterAdmin) {
      // Master Admin has "God Mode" - can assign ANYONE to ANYTHING.
      // This specifically covers the requirement: "for an external user only the master admin can grant access"
    }

    // ============================================================
    // RULE 2: DEPARTMENT ADMIN LOGIC
    // ============================================================
    else if (requester.role === UserRole.DeptAdmin) {

      // A. RESTRICTION: Cannot manage View Only Users
      if (targetUser.role === UserRole.ViewOnlyUser) {
        return new NextResponse('Only Master Admin can grant access to External (View Only) Users', { status: 403 });
      }

      // B. RESTRICTION: Target User must be in the SAME Department
      if (targetUser.departmentId !== requester.departmentId) {
        return new NextResponse('You can only manage users within your own department', { status: 403 });
      }

      // C. RESTRICTION: Category must be in the SAME Department
      if (category.departmentId !== requester.departmentId) {
        return new NextResponse('You cannot grant access to categories outside your department', { status: 403 });
      }

      // D. RESTRICTION: Target must be a Dept User (optional, prevents editing other Admins if you want)
      if (targetUser.role !== UserRole.DeptUser) {
         // Usually Dept Admins shouldn't be messing with other Dept Admins' permissions,
         // but strictly they manage "Users". Let's allow it if they are in the same dept,
         // or restrict it if you prefer strict hierarchy.
         // For now, we allow managing anyone "below" or "equal" in the dept except themselves.
      }
    }

    // ============================================================
    // RULE 3: EVERYONE ELSE -> FORBIDDEN
    // ============================================================
    else {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // 3. APPLY UPDATE
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

// DELETE remains similar (Revoke Access), applying the same logic checks
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');
    const categoryId = searchParams.get('categoryId');

    if (!targetUserId || !categoryId) return new NextResponse('Missing params', { status: 400 });

    const requester = session.user;
    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    const category = await prisma.category.findUnique({ where: { id: categoryId } });

    if (!targetUser || !category) return new NextResponse('Not found', { status: 404 });

    // SAME CHECKS AS ABOVE
    if (requester.role === UserRole.DeptAdmin) {
       if (targetUser.role === UserRole.ViewOnlyUser) return new NextResponse('Forbidden: Only Master Admin manages External Users', { status: 403 });
       if (targetUser.departmentId !== requester.departmentId) return new NextResponse('Forbidden: Cross-Dept User', { status: 403 });
       if (category.departmentId !== requester.departmentId) return new NextResponse('Forbidden: Cross-Dept Category', { status: 403 });
    } else if (requester.role !== UserRole.MasterAdmin) {
       return new NextResponse('Forbidden', { status: 403 });
    }

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