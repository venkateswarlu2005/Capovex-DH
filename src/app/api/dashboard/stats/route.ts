import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/authOptions';
import { UserRole, RequestStatus, UserStatus } from '@/shared/enums';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    const { role, id: userId, departmentId } = session.user;

    let stats = {
      totalDocuments: 0,
      activeUsers: 0,
      openRequests: 0,
      storageUsed: 0, // Optional: if you track file size sums
    };

    // ============================================================
    // 1. MASTER ADMIN (Global Counts)
    // ============================================================
    if (role === UserRole.MasterAdmin) {
      const [docCount, userCount, reqCount] = await Promise.all([
        prisma.document.count(),
        prisma.user.count({ where: { status: UserStatus.Active } }),
        prisma.request.count({ where: { status: RequestStatus.PENDING } })
      ]);

      stats.totalDocuments = docCount;
      stats.activeUsers = userCount;
      stats.openRequests = reqCount;
    }

    // ============================================================
    // 2. DEPT ADMIN (Department Counts)
    // ============================================================
    else if (role === UserRole.DeptAdmin && departmentId) {
      const [docCount, userCount, reqCount] = await Promise.all([
        // Count docs in this department
        prisma.document.count({
          where: { category: { departmentId } }
        }),
        // Count users in this department
        prisma.user.count({
          where: { departmentId, status: UserStatus.Active }
        }),
        // Count pending requests MADE by this admin (so they can track them)
        prisma.request.count({
          where: { requesterId: userId, status: RequestStatus.PENDING }
        })
      ]);

      stats.totalDocuments = docCount;
      stats.activeUsers = userCount;
      stats.openRequests = reqCount;
    }

    // ============================================================
    // 3. DEPT USER / VIEW ONLY (Personal Counts)
    // ============================================================
    else {
      // Count docs they have explicit access to
      const accessList = await prisma.userCategoryAccess.findMany({
        where: { userId },
        select: { categoryId: true }
      });

      const categoryIds = accessList.map(a => a.categoryId);

      const [docCount] = await Promise.all([
        prisma.document.count({
          where: { categoryId: { in: categoryIds } }
        })
      ]);

      stats.totalDocuments = docCount;
      // Users don't usually see "Active Users" count of the whole system,
      // maybe just return 0 or the count of their team if needed.
      stats.activeUsers = 0;
      stats.openRequests = 0;
    }

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}