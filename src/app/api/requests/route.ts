import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@/shared/enums';
import { RequestStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const { role, id: userId, departmentId } = session.user;

    let whereClause: any = {};

    // 1. MASTER ADMIN: Sees ALL Pending requests (Incoming to them)
    if (role === UserRole.MasterAdmin) {
      whereClause = {
        status: RequestStatus.PENDING
      };
    }
    // 2. DEPT ADMIN: Sees requests they SENT (to track status)
    else if (role === UserRole.DeptAdmin) {
      whereClause = {
        requesterId: userId
      };
    }
    // 3. OTHERS: Cannot view requests list
    else {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const requests = await prisma.request.findMany({
      where: whereClause,
      include: {
        requester: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            department: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}