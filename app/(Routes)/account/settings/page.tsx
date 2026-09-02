import { AllSettings } from '@/app/(Routes)/account/settings/AllSettings';
import { authOptions } from '@/lib/auth';
import { hashSessionId } from '@/lib/auth/session';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

const page = async () => {
    const session = await getServerSession(authOptions);

    const userNotifications = await prisma.user.findUnique({
        where: {
            id: session?.user.id,
        },
        select: {
            marketingNotifications: true,
            orderNotifications: true,
        }
    });

    if (!userNotifications) {
        return redirect("/account/overview");
    }

    return (
        <AllSettings userNotifications={userNotifications} />
    );
};

export default page;