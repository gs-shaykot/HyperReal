import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import CourierDashboard from "@/app/components/courier/CourierDashboard";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function CourierPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.sessionRevoked) {
        redirect("/login?callbackUrl=%2Fcourier");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            role: true,
            isBlocked: true,
            courierProfile: { select: { isActive: true } },
        },
    });

    if (!user || user.isBlocked || user.role !== "COURIER" || !user.courierProfile?.isActive) {
        redirect("/login?callbackUrl=%2Fcourier");
    }

    return <CourierDashboard />;
}
