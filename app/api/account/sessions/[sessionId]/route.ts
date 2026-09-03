import { authOptions } from "@/lib/auth";
import { hashSessionId } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function DELETE(_request: Request, { params, }: { params: Promise<{ sessionId: string }>; }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || !session.sessionId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const currentSessionHash = hashSessionId(session.sessionId);

        const { sessionId } = await params;

        const targetSession = await prisma.session.findFirst({
            where: {
                id: sessionId,
                userId: session.user.id,
            },
        });

        if (!targetSession) {
            return NextResponse.json({ message: "Session not found" }, { status: 404 });
        }

        if (targetSession.tokenHash === currentSessionHash) {
            return NextResponse.json({ success: false, message: "You cannot remove your current session.", }, { status: 400 });
        }
 
        await prisma.session.delete({
            where: {
                id: targetSession.id,
            },
        });

        return NextResponse.json({ success: true, message: "Session logged out successfully." }, { status: 200 });
    }
    catch (error) {
        console.error("DELETE /account/sessions/[sessionId]:", error);
        return NextResponse.json({ success: false, message: "Failed to remove session" }, { status: 500 });
    }
}