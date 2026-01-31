import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@/shared/enums';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Security Check: Only MASTER_ADMIN can create departments
    if (!session || session.user.role !== UserRole.MasterAdmin) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }

    // 2. Create Department
    const department = await prisma.department.create({
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(department);
  } catch (error: any) {
    // Handle unique constraint violation (P2002 is Prisma's code for unique constraint)
    if (error.code === 'P2002') {
      return new NextResponse('Department name already exists', { status: 409 });
    }
    console.error('Error creating department:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    // Everyone can see the list of departments (needed for dropdowns),
    // but you can restrict this if you want.
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { users: true, categories: true }
        }
      }
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}