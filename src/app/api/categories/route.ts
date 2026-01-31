import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@/shared/enums';
import { RequestType, RequestStatus, ActivityType } from '@prisma/client'; // Import from Prisma Client directly

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const body = await request.json();
    const { name, departmentId } = body;

    if (!name || !departmentId) {
      return new NextResponse('Name and Department ID are required', { status: 400 });
    }

    // ============================================================
    // CASE A: MASTER ADMIN -> Create Category Immediately
    // ============================================================
    if (session.user.role === UserRole.MasterAdmin) {
      const category = await prisma.category.create({
        data: {
          name,
          departmentId,
        },
      });

      // Log Activity
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: ActivityType.CREATE_CATEGORY,
          details: `Created category "${name}"`,
          metadata: { categoryId: category.id, departmentId }
        }
      });

      return NextResponse.json({
        message: 'Category created successfully',
        category,
        action: 'CREATED'
      });
    }

    // ============================================================
    // CASE B: DEPT ADMIN -> Create Request (Approval Needed)
    // ============================================================
    if (session.user.role === UserRole.DeptAdmin) {
      // Security: Dept Admin can only request for their OWN department
      if (session.user.departmentId !== departmentId) {
        return new NextResponse('You can only create categories in your own department', { status: 403 });
      }

      // Create Request
      const newRequest = await prisma.request.create({
        data: {
          type: RequestType.CREATE_CATEGORY,
          status: RequestStatus.PENDING,
          requesterId: session.user.id,
          details: {
            categoryName: name,
            departmentId: departmentId,
          },
        },
      });

      return NextResponse.json({
        message: 'Request sent to Master Admin for approval',
        request: newRequest,
        action: 'REQUESTED'
      });
    }

    // ============================================================
    // CASE C: OTHERS -> Forbidden
    // ============================================================
    return new NextResponse('You do not have permission to create categories', { status: 403 });

  } catch (error: any) {
    if (error.code === 'P2002') {
      return new NextResponse('Category name already exists in this department', { status: 409 });
    }
    console.error('Error in category route:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');

    // If Dept User/View Only, they might only see categories they have access to.
    // For now, let's return all categories in the department,
    // and handle "file visibility" at the document level.

    const whereClause = departmentId ? { departmentId } : {};

    const categories = await prisma.category.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { documents: true } }
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}