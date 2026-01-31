import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  // Check authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Delete messages older than 15 days
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    const result = await prisma.message.deleteMany({
      where: {
        createdAt: {
          lt: fifteenDaysAgo,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.count} messages older than 15 days.`
    });
  } catch (error) {
    console.error('Chat cleanup failed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}