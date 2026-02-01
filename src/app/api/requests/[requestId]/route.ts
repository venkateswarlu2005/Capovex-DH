import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@/shared/enums';
import { RequestStatus, RequestType, ActivityType } from '@prisma/client';

export async function PUT(
  request: Request,
  context: { params: Promise<{ requestId: string }> }
) {
  try {
    // ✅ NEXT 15 FIX
    const { requestId } = await context.params;

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== UserRole.MasterAdmin) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const { status } = await request.json();

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return new NextResponse('Invalid status', { status: 400 });
    }

    const existingRequest = await prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!existingRequest) {
      return new NextResponse('Request not found', { status: 404 });
    }

    if (existingRequest.status !== RequestStatus.PENDING) {
      return new NextResponse('Request already processed', { status: 400 });
    }

    /* -------------------- APPROVE LOGIC -------------------- */
    if (status === 'APPROVED') {
      if (existingRequest.type === RequestType.CREATE_CATEGORY) {
        const details = existingRequest.details as {
          categoryName?: string;
          departmentId?: string;
        } | null;

        // ✅ SAFETY GUARD (CRITICAL)
        if (!details?.categoryName || !details?.departmentId) {
          return new NextResponse(
            'Invalid CREATE_CATEGORY request (missing details)',
            { status: 400 }
          );
        }

        const duplicate = await prisma.category.findUnique({
          where: {
            name_departmentId: {
              name: details.categoryName,
              departmentId: details.departmentId,
            },
          },
        });

        if (!duplicate) {
          await prisma.category.create({
            data: {
              name: details.categoryName,
              departmentId: details.departmentId,
            },
          });
        }
      }
    }

    /* -------------------- UPDATE STATUS -------------------- */
    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: {
        status: status as RequestStatus,
        approverId: session.user.id,
      },
    });

    /* -------------------- ACTIVITY LOG -------------------- */
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action:
          status === 'APPROVED'
            ? ActivityType.APPROVE_REQUEST
            : ActivityType.REJECT_REQUEST,
        details: `${status} request for ${existingRequest.type}`,
        metadata: { requestId },
      },
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error processing request:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
