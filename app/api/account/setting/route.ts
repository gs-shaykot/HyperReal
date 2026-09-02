import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user.id || !session.sessionId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const { marketingEmails, orderNotifications } = await req.json();
        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                marketingNotifications: marketingEmails, orderNotifications: orderNotifications
            }
        });

        return NextResponse.json({ success: true, message: "Notification settings updated successfully" }, { status: 200 });
    }
    catch (err: any) {
        console.error("Error updating notification settings:", err);
        return NextResponse.json({ message: err.message }, { status: 500 })
    }
}