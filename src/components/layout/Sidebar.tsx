'use client';

import { useSession } from 'next-auth/react';
import MasterAdminSidebar from './MasterAdminSidebar';
// import DeptAdminSidebar from './DeptAdminSidebar';
// import DeptUserSidebar from './DeptUserSidebar';

export default function Sidebar() {
  const { data: session, status } = useSession();

  if (status === 'loading') return null;
  if (!session?.user?.role) return null;

  switch (session.user.role) {
    case 'MASTER_ADMIN':
      return <MasterAdminSidebar />;

    // later you can add these
    // case 'DEPT_ADMIN':
    //   return <DeptAdminSidebar />;

    // case 'DEPT_USER':
    //   return <DeptUserSidebar />;

    default:
      return null;
  }
}
