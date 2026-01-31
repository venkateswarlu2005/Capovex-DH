import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@/shared/enums';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const user = session.user;

    // Only Admins need to see a list of channels
    if (user.role !== UserRole.MasterAdmin && user.role !== UserRole.DeptAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const whereClause: any = {};

    // Dept Admin: Only see channels for their department
    if (user.role === UserRole.DeptAdmin) {
      whereClause.departmentId = user.departmentId;
    }
    // Master Admin: Sees all

    // Fetch channels with the latest message to show snippet
    const channels = await prisma.chatChannel.findMany({
      where: whereClause,
      include: {
        department: { select: { name: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: { select: { firstName: true, lastName: true } } }
        }
      },
      orderBy: { updatedAt: 'desc' } // Most active top
    });

    // Format for frontend
    const formatted = await Promise.all(channels.map(async (c) => {
      // If it's a private viewer chat, fetch the viewer's name
      let title = "General Room";
      if (c.viewerUserId) {
        const viewer = await prisma.user.findUnique({
            where: { id: c.viewerUserId },
            select: { firstName: true, lastName: true }
        });
        title = viewer ? `${viewer.firstName} ${viewer.lastName}` : "Unknown Viewer";
      }

      return {
        id: c.id,
        departmentId: c.departmentId,
        departmentName: c.department.name,
        type: c.viewerUserId ? 'PRIVATE_SUPPORT' : 'DEPT_ROOM',
        title,
        viewerUserId: c.viewerUserId,
        lastMessage: c.messages[0]?.content || "No messages",
        lastMessageSender: c.messages[0]?.sender?.firstName || "",
        updatedAt: c.updatedAt
      };
    }));

    return NextResponse.json(formatted);

  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}