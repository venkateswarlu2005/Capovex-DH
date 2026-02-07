import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

import { UserRole } from '@/shared/enums';
import { MIDDLEWARE_MATCHER_PATTERN } from '@/shared/config/routesConfig';

const ROLE_ROUTE_MAP: Record<string, UserRole[]> = {
  '/m_admin': [UserRole.MasterAdmin],
  '/d_admin': [UserRole.DeptAdmin],
  '/d_user': [UserRole.DeptUser],
  '/v_user': [UserRole.ViewOnlyUser],
};

export default withAuth(
  async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.redirect(new URL('/auth/sign-in', req.url));
    }

    const role = token.role as UserRole | undefined;

    if (!role) {
      return NextResponse.redirect(new URL('/403', req.url));
    }

    for (const routePrefix in ROLE_ROUTE_MAP) {
      if (pathname.startsWith(routePrefix)) {
        const allowedRoles = ROLE_ROUTE_MAP[routePrefix];

        if (!allowedRoles.includes(role)) {
          return NextResponse.redirect(new URL('/403', req.url));
        }
      }
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: '/auth/sign-in',
    },
  },
);

export const config = {
  matcher: [MIDDLEWARE_MATCHER_PATTERN],
};
