import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@/shared/enums';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const { role, id: userId, departmentId } = session.user;

    let whereClause: any = {};

    // 1. MASTER ADMIN: See All
    if (role === UserRole.MasterAdmin) {
      whereClause = {}; // No filter
    }

    // 2. DEPT ADMIN: See activity of users in their department
    else if (role === UserRole.DeptAdmin && departmentId) {
      whereClause = {
        user: {
          departmentId: departmentId
        }
      };
    }

    // 3. OTHERS: See only OWN activity
    else {
      whereClause = {
        userId: userId
      };
    }

    const activities = await prisma.activityLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true // Useful for displaying a small icon in the list
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10 // Limit to 10 items for the dashboard widget
    });

    // Format for frontend
    const formatted = activities.map(log => ({
      id: log.id,
      user: `${log.user.firstName} ${log.user.lastName}`,
      userEmail: log.user.email,
      avatar: log.user.avatarUrl,
      action: log.action,
      details: log.details,
      timestamp: log.createdAt,
    }));

    return NextResponse.json(formatted);

  } catch (error) {
    console.error('Activity log error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}