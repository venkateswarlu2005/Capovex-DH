import NextAuth from 'next-auth';
import type { AuthProvider, UserStatus, UserRole } from '@/shared/enums';

declare module 'next-auth' {
  interface User {
    id: string;
    userId: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    email: string;
    authProvider: AuthProvider;
    avatarUrl?: string;
    status?: UserStatus;
    departmentId?: string | null;
  }

  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    userId: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    email: string;
    authProvider: AuthProvider;
    avatarUrl?: string;
    status?: UserStatus;
    departmentId?: string | null;
    remember30d?: boolean;
  }
}