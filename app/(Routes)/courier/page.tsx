import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import CourierDashboard from "@/app/components/courier/CourierDashboard";
import { authOptions } from "@/lib/auth";

export default async function CourierPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.sessionRevoked) {
        redirect("/login?callbackUrl=%2Fcourier");
    }

    return <CourierDashboard />;
}
