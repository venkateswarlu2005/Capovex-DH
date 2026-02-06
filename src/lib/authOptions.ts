import bcryptjs from 'bcryptjs';
import { NextAuthOptions } from 'next-auth';
import { jwtDecode } from 'jwt-decode';
import CredentialsProvider from 'next-auth/providers/credentials';

import prisma from '@/lib/prisma';
import { unifyUserByEmail } from '@/services/auth/authService';
import {
  AuthProvider as AuthProviderEnum,
  UserRole,
  UserStatus,
} from '@/shared/enums';

/* -------------------------------------------------------------------------- */
/* Providers                                                                  */
/* -------------------------------------------------------------------------- */

const providers: any[] = [];

/* ============================ CREDENTIALS LOGIN ============================ */
if (process.env.AUTH_METHOD?.toLowerCase() === 'credentials') {
  providers.push(
    CredentialsProvider({
      name: 'Local Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        remember: { label: 'Remember', type: 'checkbox' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('Email and password are required');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) throw new Error('No user found with that e-mail');
        if (user.status !== UserStatus.Active) {
          throw new Error('Please verify your e-mail before signing in');
        }

        const isPasswordValid = await bcryptjs.compare(
          credentials.password,
          user.password!,
        );

        if (!isPasswordValid) throw new Error('Invalid password');

        return {
          id: user.id.toString(),
          userId: user.userId,
          email: user.email,
          role: user.role as UserRole,
          firstName: user.firstName,
          lastName: user.lastName,
          authProvider: user.authProvider as AuthProviderEnum,
          avatarUrl: user.avatarUrl ?? undefined,
          status: user.status as UserStatus,
          departmentId: user.departmentId,
          remember: credentials.remember === 'true',
        };
      },
    }),
  );
}

/* =============================== AUTH0 LOGIN =============================== */
else if (process.env.AUTH_METHOD?.toLowerCase() === 'auth0') {
  providers.push(
    CredentialsProvider({
      name: 'Auth0 ROPG',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('Email and password are required');
        }

        const resp = await fetch(
          `${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              grant_type: 'password',
              username: credentials.email,
              password: credentials.password,
              client_id: process.env.AUTH0_CLIENT_ID,
              client_secret: process.env.AUTH0_CLIENT_SECRET,
              realm: process.env.AUTH0_DB_CONNECTION,
            }),
          },
        );

        const auth0 = await resp.json();
        if (!resp.ok || !auth0.id_token) {
          throw new Error(auth0.error_description || 'Invalid credentials');
        }

        const claims = jwtDecode<{ email_verified?: boolean }>(
          auth0.id_token,
        );

        if (!claims.email_verified) {
          throw new Error('Please verify your e-mail');
        }

        const finalUser = await unifyUserByEmail(credentials.email, {
          fullName: '',
          picture: undefined,
        });

        if (finalUser.status !== UserStatus.Active) {
          await prisma.user.update({
            where: { userId: finalUser.userId },
            data: { status: UserStatus.Active },
          });
        }

        return {
          id: finalUser.id.toString(),
          userId: finalUser.userId,
          email: finalUser.email,
          role: finalUser.role as UserRole,
          firstName: finalUser.firstName,
          lastName: finalUser.lastName,
          authProvider: finalUser.authProvider as AuthProviderEnum,
          avatarUrl: finalUser.avatarUrl ?? undefined,
          status: UserStatus.Active,
          departmentId: finalUser.departmentId,
        };
      },
    }),
  );
}

/* -------------------------------------------------------------------------- */
/* NextAuth Configuration                                                     */
/* -------------------------------------------------------------------------- */

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // default 1 day
  },

  providers,

  pages: {
    signIn: '/auth/sign-in',
  },

  callbacks: {
    async signIn() {
      return true;
    },

    /* ============================ JWT CALLBACK ============================ */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.userId = user.userId;
        token.email = user.email;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.authProvider = user.authProvider;
        token.avatarUrl = user.avatarUrl;
        token.status = user.status;
        token.departmentId = user.departmentId;

        token.remember30d = (user as any).remember ?? false;

        if (token.remember30d) {
          token.exp =
            Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
        }
      }

      return token;
    },

    /* =========================== SESSION CALLBACK ========================== */
    async session({ session, token }) {
      const categoryAccess = await prisma.userCategoryAccess.findMany({
        where: { userId: token.id as string },
        select: {
          category: {
            select: {
              id: true,
              name: true,
              departmentId: true,
            },
          },
          canUpload: true,
          canDelete: true,
        },
        orderBy: {
          category: { createdAt: 'asc' },
        },
      });

      session.user = {
        id: token.id as string,
        userId: token.userId as string,
        email: token.email as string,
        role: token.role as UserRole,
        firstName: token.firstName as string,
        lastName: token.lastName as string,
        authProvider: token.authProvider as AuthProviderEnum,
        avatarUrl: token.avatarUrl as string | undefined,
        status: token.status as UserStatus,
        departmentId: token.departmentId || null,
      };

      (session.user as any).categoryAccess = categoryAccess;

      return session;
    },

    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
};
