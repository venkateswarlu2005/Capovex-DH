import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { UserRole } from '@/shared/enums';

export default async function DeptAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== UserRole.DeptAdmin) {
    redirect('/403');
  }

  return <>{children}</>;
}
