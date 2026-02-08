import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { authOptions } from '@/lib/authOptions';
import { UserRole, UserStatus, AuthProvider } from '@/shared/enums';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Security: Only Master Admin can create users directly
    if (!session || session.user.role !== UserRole.MasterAdmin) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const body = await request.json();
    const { email, firstName, lastName, password, role, departmentId } = body;

    // 2. Validation
    if (!email || !password || !firstName) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // 3. Check if email exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new NextResponse('User already exists', { status: 409 });
    }

    // 4. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create User
    const newUser = await prisma.user.create({
      data: {
        userId: randomUUID().replace(/-/g, ''), // Legacy ID format
        email,
        password: hashedPassword,
        firstName,
        lastName: lastName || '',
        role: role || UserRole.ViewOnlyUser, // Default role
        departmentId: departmentId || null,
        status: UserStatus.Active, // Auto-activate since Admin created them
        authProvider: AuthProvider.Credentials,
      },
    });

    return NextResponse.json(newUser);

  } catch (error) {
    console.error('Error creating user:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}