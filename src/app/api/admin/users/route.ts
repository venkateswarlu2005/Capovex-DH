import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@/shared/enums';

/* ================================
   1. LIST USERS
   ================================ */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const requester = session.user;
    let whereClause: any = {};

    // A. MASTER ADMIN → Sees everyone
    if (requester.role === UserRole.MasterAdmin) {
      whereClause = {};
    }
    // B. DEPT ADMIN → Sees only their department users
    else if (requester.role === UserRole.DeptAdmin) {
      whereClause = {
        departmentId: requester.departmentId,
      };
    }
    // C. Others → Forbidden
    else {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        departmentId: true,
        department: { select: { name: true } },
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

/* ================================
   2. UPDATE USER ROLE / DEPARTMENT
   (MASTER ADMIN ONLY)
   ================================ */
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 🔒 Only Master Admin can update roles or departments
    if (!session || session.user.role !== UserRole.MasterAdmin) {
      return new NextResponse(
        'Only Master Admin can update User Roles/Departments',
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, role, departmentId } = body;

    if (!userId || !role) {
      return new NextResponse('User ID and Role are required', {
        status: 400,
      });
    }

    // ✅ Allow UI role VIEW_ONLY but map it safely
    const allowedRoles = [
      UserRole.MasterAdmin,
      UserRole.DeptAdmin,
      UserRole.DeptUser,
      'VIEW_ONLY',
    ];

    if (!allowedRoles.includes(role)) {
      return new NextResponse('Invalid role value', { status: 400 });
    }

    // ✅ OPTION 2: Map VIEW_ONLY → DEPT_USER for Prisma
    const prismaRole =
      role === 'VIEW_ONLY' ? UserRole.DeptUser : role;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: prismaRole,
        departmentId: departmentId || null,
      },
      select: {
        id: true,
        email: true,
        role: true,
        departmentId: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
