import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"; // Adjust path if needed
import { UserRole } from '@/shared/enums';

export default async function Home() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/auth/sign-in');
    }

    if (session.user.role === UserRole.MasterAdmin) {
        redirect('/m_admin/overview');
    }

    redirect('/documents');
}