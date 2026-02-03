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
  
    const { requestId } = await context.params;

    const session = await getServerSession(authOptions);

    // 1. Authorization Check
    if (!session || session.user.role !== UserRole.MasterAdmin) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const { status } = await request.json();

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return new NextResponse('Invalid status', { status: 400 });
    }

    // 2. Fetch the Request
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
        
    
        const details = existingRequest.details as any;

       
        const categoryName = details?.categoryName || details?.name;
        
        const departmentId = details?.departmentId || details?.deptId || details?.department;

        // Safety Guard
        if (!categoryName || !departmentId) {
          console.error("Failed to approve request. Missing details:", details);
          return new NextResponse(
            'Invalid CREATE_CATEGORY request (missing details)',
            { status: 400 }
          );
        }

        // Check for duplicates using the resolved variables
        const duplicate = await prisma.category.findUnique({
          where: {
            name_departmentId: {
              name: categoryName,
              departmentId: departmentId,
            },
          },
        });

        if (!duplicate) {
          await prisma.category.create({
            data: {
              name: categoryName,
              departmentId: departmentId,
            },
          });
        }
      }
    }

    /* -------------------- UPDATE REQUEST STATUS -------------------- */
    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: {
        status: status as RequestStatus,
        approverId: session.user.id,
      },
    });

    /* -------------------- LOG ACTIVITY -------------------- */
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