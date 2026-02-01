import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@/shared/enums';

// 1. LIST USERS
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const requester = session.user;
    let whereClause: any = {};

    // A. MASTER ADMIN: Sees EVERYONE
    if (requester.role === UserRole.MasterAdmin) {
       whereClause = {};
    }
    // B. DEPT ADMIN: Sees ONLY their Department's Users
    else if (requester.role === UserRole.DeptAdmin) {
       whereClause = {
         departmentId: requester.departmentId
       };
    }
    // C. OTHERS: Forbidden
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
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// 2. ASSIGN ROLES (MASTER ADMIN ONLY)
// As per your requirement: "Master can only set the new department admins"
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // STRICT: Only Master Admin can change a user's Role or Department
    // Dept Admins can assign *Categories* (via Permissions API), but not *Roles*.
    if (!session || session.user.role !== UserRole.MasterAdmin) {
      return new NextResponse('Only Master Admin can update User Roles/Departments', { status: 403 });
    }

    const body = await request.json();
    const { userId, role, departmentId } = body;

    if (!userId || !role) {
      return new NextResponse('User ID and Role are required', { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role,
        departmentId: departmentId || null,
      },
      select: { id: true, email: true, role: true, departmentId: true }
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Error updating user:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}