import { authOptions } from "@/lib/auth";
import { hashSessionId } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || !session.sessionId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const sessions = await prisma.session.findMany({
            where: {
                userId: session.user.id,
                expiresAt: {
                    gt: new Date(),
                }
            },
            orderBy: {
                lastUsed: 'desc',
            }
        });

        const currentSessionHash = hashSessionId(session.sessionId);

        const userAgent = req.headers.get("user-agent");

        const forwardedFor = req.headers.get("x-forwarded-for");

        const realIp = req.headers.get("x-real-ip");

        const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? realIp ?? null;

        const currentSession = await prisma.session.findUnique({
            where: {
                tokenHash: currentSessionHash,
            },
        });

        if (currentSession) {
            await prisma.session.update({
                where: {
                    id: currentSession.id,
                },
                data: {
                    userAgent,
                    ipAddress,
                    lastUsed: new Date(),
                },
            });
        }
        return NextResponse.json({
            sessions: sessions.map((item) => ({
                id: item.id,
                userAgent: item.userAgent,
                ipAddress: item.ipAddress,
                createdAt: item.createdAt,
                lastUsed: item.lastUsed,
                isCurrent:
                    item.tokenHash === currentSessionHash,
            })),
        });
    }
    catch (error) {
        console.error("GET /account/sessions:", error);

        return NextResponse.json(
            { message: "Failed to fetch sessions" },
            { status: 500 }
        );
    }
}