import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import CourierManagement from "@/app/components/admin/couriers/CourierManagement";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function AdminCouriersPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.sessionRevoked) redirect("/login?callbackUrl=%2Fadmin%2Fcouriers");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, isBlocked: true },
    });

    if (!user || user.role !== "ADMIN" || user.isBlocked) redirect("/");

    return <CourierManagement />;
}
