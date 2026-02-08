import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/authOptions';
import { UserRole, UserStatus, AuthProvider } from '@/shared/enums';

/* ================================
   1. LIST USERS (GET)
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
   2. CREATE USER (POST)
   (Master Admin Only)
   ================================ */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 🔒 Security: Only Master Admin can create users directly
    if (!session || session.user.role !== UserRole.MasterAdmin) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const body = await request.json();
    const { email, firstName, lastName, password, role, departmentId } = body;

    // Validation
    if (!email || !password || !firstName) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Check if email exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new NextResponse('User already exists', { status: 409 });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Map legacy 'VIEW_ONLY' string to correct Enum if necessary
    const finalRole = role === 'VIEW_ONLY' ? UserRole.ViewOnlyUser : role;

    // Create User
    const newUser = await prisma.user.create({
      data: {
        userId: randomUUID().replace(/-/g, ''), // Legacy ID format
        email,
        password: hashedPassword,
        firstName,
        lastName: lastName || '',
        role: finalRole || UserRole.ViewOnlyUser,
        departmentId: departmentId || null,
        status: UserStatus.Active, // Auto-activate since Admin created them
        authProvider: AuthProvider.Credentials,
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      }
    });

    return NextResponse.json(newUser);

  } catch (error) {
    console.error('Error creating user:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

/* ================================
   3. UPDATE USER ROLE / DEPT (PUT)
   (Master Admin Only)
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

    // ✅ FIXED: Included UserRole.ViewOnlyUser and handled mapping
    const allowedRoles = [
      UserRole.MasterAdmin,
      UserRole.DeptAdmin,
      UserRole.DeptUser,
      UserRole.ViewOnlyUser,
      'VIEW_ONLY', // for backward compatibility with frontend
    ];

    if (!allowedRoles.includes(role)) {
      return new NextResponse('Invalid role value', { status: 400 });
    }

    // ✅ FIXED: Map 'VIEW_ONLY' to the correct Prisma Enum 'VIEW_ONLY_USER'
    // If the role is already valid (e.g. 'DEPT_ADMIN'), use it as is.
    const prismaRole =
      role === 'VIEW_ONLY' ? UserRole.ViewOnlyUser : role;

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