import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@/shared/enums';
import { RequestStatus, RequestType, ActivityType } from '@prisma/client';

export async function PUT(
  request: Request,
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    // Only Master Admin can approve requests (for now)
    if (!session || session.user.role !== UserRole.MasterAdmin) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const { requestId } = params;
    const body = await request.json();
    const { status } = body; // 'APPROVED' or 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return new NextResponse('Invalid status', { status: 400 });
    }

    // 1. Fetch the Request
    const existingRequest = await prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!existingRequest) {
      return new NextResponse('Request not found', { status: 404 });
    }

    if (existingRequest.status !== RequestStatus.PENDING) {
      return new NextResponse('Request is already processed', { status: 400 });
    }

    // 2. Handle Logic based on Type (e.g., CREATE_CATEGORY)
    if (status === 'APPROVED') {
      if (existingRequest.type === RequestType.CREATE_CATEGORY) {
        const details = existingRequest.details as any;

        // Check if category already exists to avoid errors
        const duplicate = await prisma.category.findUnique({
          where: {
            name_departmentId: {
              name: details.categoryName,
              departmentId: details.departmentId
            }
          }
        });

        if (!duplicate) {
          // Perform the Action: Create the Category
          await prisma.category.create({
            data: {
              name: details.categoryName,
              departmentId: details.departmentId,
            }
          });
        }
      }

      // Future: Add logic here for RequestType.ACCESS_DOCUMENT
    }

    // 3. Update Request Status
    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: {
        status: status as RequestStatus,
        approverId: session.user.id,
      },
    });

    // 4. Log Activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: status === 'APPROVED' ? ActivityType.APPROVE_REQUEST : ActivityType.REJECT_REQUEST,
        details: `${status} request for ${existingRequest.type}`,
        metadata: { requestId: updatedRequest.id }
      }
    });

    return NextResponse.json(updatedRequest);

  } catch (error) {
    console.error('Error processing request:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}