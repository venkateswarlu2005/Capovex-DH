import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { UserRole } from '@/shared/enums';
import prisma from '@/lib/prisma';

export default async function Home() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect('/auth/sign-in');
    }

    const role = session.user.role;
    const userId = session.user.id;

    switch (role) {
        case UserRole.MasterAdmin:
            redirect('/m_admin/overview');
        
        case UserRole.DeptAdmin:
            redirect('/d_admin');
        
        case UserRole.DeptUser:
            redirect('/d_user');
        
        case UserRole.ViewOnlyUser: {
            // Find the first category this user is allowed to see
            const firstAccess = await prisma.userCategoryAccess.findFirst({
                where: { userId: userId },
                select: { categoryId: true },
                orderBy: { category: { name: 'asc' } }
            });

            if (firstAccess?.categoryId) {
                redirect(`/v_user/documents?categoryId=${firstAccess.categoryId}`);
            } else {
                redirect('/v_user/no-access');
            }
        }

        default:
            redirect('/auth/sign-in');
    }
}