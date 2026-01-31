import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@/shared/enums';
import { ActivityType } from '@prisma/client';

// GET: Fetch Messages
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');

    // For Admins viewing a specific user's thread (support mode)
    const viewerUserId = searchParams.get('viewerUserId');

    const user = session.user;
    let channelId = null;

    // 1. Determine which Channel to look at
    if (user.role === UserRole.ViewOnlyUser) {
      // Viewer: Needs a channel for the specific department they are viewing
      if (!departmentId) return new NextResponse('Department ID required for Viewers', { status: 400 });

      // Find or create private channel for this Viewer + Dept
      let channel = await prisma.chatChannel.findFirst({
        where: { departmentId, viewerUserId: user.id }
      });

      if (!channel) {
        channel = await prisma.chatChannel.create({
           data: { departmentId, viewerUserId: user.id }
        });
      }
      channelId = channel.id;
    }
    else if (user.role === UserRole.DeptUser) {
      // Dept User: Chats in the main Department Channel
      const deptId = user.departmentId;
      if (!deptId) return new NextResponse('User has no department', { status: 400 });

      let channel = await prisma.chatChannel.findFirst({
        where: { departmentId: deptId, viewerUserId: null } // null = Public Dept Room
      });

      if (!channel) {
         channel = await prisma.chatChannel.create({
            data: { departmentId: deptId, viewerUserId: null }
         });
      }
      channelId = channel.id;
    }
    else {
      // ADMINS (Master / Dept Admin)
      // They can view ANY channel, but they need to specify which one via params

      // A. If viewing a specific Viewer's thread
      if (viewerUserId && departmentId) {
        const channel = await prisma.chatChannel.findFirst({
          where: { departmentId, viewerUserId }
        });
        channelId = channel?.id;
      }
      // B. If viewing the general Dept Room
      else if (departmentId) {
        const channel = await prisma.chatChannel.findFirst({
          where: { departmentId, viewerUserId: null }
        });
        channelId = channel?.id;
      }
    }

    if (!channelId) return NextResponse.json([]); // No chat exists yet

    // 2. Fetch Messages
    const messages = await prisma.message.findMany({
      where: { channelId },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'asc' },
      take: 100 // Limit to last 100
    });

    return NextResponse.json(messages);

  } catch (error) {
    console.error('Chat error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// POST: Send Message
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const body = await request.json();
    const { content, departmentId, viewerUserId } = body;
    // viewerUserId is passed ONLY if an Admin is replying to a specific Viewer

    if (!content) return new NextResponse('Message empty', { status: 400 });

    const user = session.user;
    let channelId = null;

    // 1. Resolve Channel (Same logic as GET, but ensures creation)
    if (user.role === UserRole.ViewOnlyUser) {
      if (!departmentId) return new NextResponse('Dept ID required', { status: 400 });
      let channel = await prisma.chatChannel.findFirst({
        where: { departmentId, viewerUserId: user.id }
      });
      if (!channel) channel = await prisma.chatChannel.create({ data: { departmentId, viewerUserId: user.id } });
      channelId = channel.id;
    }
    else if (user.role === UserRole.DeptUser) {
       // Defaults to their own dept
       let channel = await prisma.chatChannel.findFirst({
          where: { departmentId: user.departmentId!, viewerUserId: null }
       });
       if (!channel) channel = await prisma.chatChannel.create({ data: { departmentId: user.departmentId!, viewerUserId: null } });
       channelId = channel.id;
    }
    else {
      // ADMINS REPLYING
      if (viewerUserId && departmentId) {
        // Reply to a Viewer
        let channel = await prisma.chatChannel.findFirst({ where: { departmentId, viewerUserId } });
        if (!channel) channel = await prisma.chatChannel.create({ data: { departmentId, viewerUserId } });
        channelId = channel.id;
      } else if (departmentId) {
        // Post in General Dept Room
        let channel = await prisma.chatChannel.findFirst({ where: { departmentId, viewerUserId: null } });
        if (!channel) channel = await prisma.chatChannel.create({ data: { departmentId, viewerUserId: null } });
        channelId = channel.id;
      }
    }

    if (!channelId) return new NextResponse('Could not resolve chat channel', { status: 400 });

    // 2. Save Message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: user.id,
        channelId
      },
      include: {
         sender: { select: { firstName: true, lastName: true, avatarUrl: true } }
      }
    });

    // 3. Log Activity (Optional, maybe too noisy for every chat)
    // await prisma.activityLog.create({ ... })

    return NextResponse.json(message);

  } catch (error) {
    console.error('Send message error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}