import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@/shared/enums';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const { role, id: userId, departmentId } = session.user;

    // ============================================================
    // 1. MASTER ADMIN (God Mode)
    // ============================================================
    if (role === UserRole.MasterAdmin) {
      return NextResponse.json({
        role,
        scope: 'GLOBAL',
        canCreateDept: true,
        canCreateCategory: true,
        accessibleCategories: 'ALL'
      });
    }

    // ============================================================
    // 2. DEPARTMENT ADMIN (Dept God Mode)
    // ============================================================
    if (role === UserRole.DeptAdmin) {
      // Fetch all categories in their department
      const categories = await prisma.category.findMany({
        where: { departmentId: departmentId! },
        select: { id: true, name: true }
      });

      return NextResponse.json({
        role,
        scope: 'DEPARTMENT',
        departmentId,
        canCreateDept: false,
        canCreateCategory: false, // Must request it
        accessibleCategories: categories.map(c => ({
          ...c,
          permissions: { canUpload: true, canDelete: true } // Dept Admins can always do this
        }))
      });
    }

    // ============================================================
    // 3. DEPT USER & VIEW ONLY (Granular Access)
    // ============================================================
    // Fetch only the categories explicitly assigned to them in UserCategoryAccess
    const accessList = await prisma.userCategoryAccess.findMany({
      where: { userId },
      include: {
        category: {
          select: { id: true, name: true, departmentId: true }
        }
      }
    });

    return NextResponse.json({
      role,
      scope: 'LIMITED',
      departmentId,
      canCreateDept: false,
      canCreateCategory: false,
      accessibleCategories: accessList.map(item => ({
        id: item.category.id,
        name: item.category.name,
        departmentId: item.category.departmentId,
        permissions: {
          canUpload: item.canUpload,
          canDelete: item.canDelete
        }
      }))
    });

  } catch (error) {
    console.error('Error fetching access:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}