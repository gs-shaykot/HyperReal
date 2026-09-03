import { authOptions } from "@/lib/auth";
import { parseDevice } from "@/lib/auth/device";
import { hashSessionId } from "@/lib/auth/hashSessionId";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || !session.sessionId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const currentSessionHash = await hashSessionId(session.sessionId);

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

        const sessions = await prisma.session.findMany({
            where: {
                userId: session.user.id,
                expiresAt: {
                    gt: new Date(),
                },
            },
            orderBy: {
                lastUsed: "desc",
            },
        });
        console.log("GET /account/sessions sessions:", sessions);
        return NextResponse.json({
            sessions: sessions.map((item) => {
                const device = parseDevice(item.userAgent);

                return {
                    id: item.id,

                    userAgent: item.userAgent,
                    ipAddress: item.ipAddress,

                    deviceType: device.deviceType,
                    deviceName: device.deviceName,
                    browser: device.browser,
                    os: device.os,

                    createdAt: item.createdAt,
                    lastUsed: item.lastUsed,
                    expiresAt: item.expiresAt,

                    isCurrent:
                        item.tokenHash === currentSessionHash,
                };
            }),
        });
    }
    catch (error) {
        console.error("GET /account/sessions:", error);

        return NextResponse.json(
            {
                message: "Failed to fetch sessions",
            },
            {
                status: 500,
            }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || !session.sessionId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const currentSessionHash = await hashSessionId(session.sessionId);

        const userAgent = req.headers.get("user-agent");

        const forwardedFor = req.headers.get("x-forwarded-for");

        const realIp = req.headers.get("x-real-ip");

        const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? realIp ?? null;

        const currentSession = await prisma.session.findUnique({
            where: {
                tokenHash: currentSessionHash,
            },
        });

        if (!currentSession) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Session not found",
                },
                {
                    status: 404,
                }
            );
        }

        if (currentSession.userId !== session.user.id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Forbidden",
                },
                {
                    status: 403,
                }
            );
        }

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

        return NextResponse.json({
            success: true,
            message: "Session information saved successfully.",
        });

    } catch (error) {
        console.error(
            "POST /account/sessions:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Failed to save session information",
            },
            {
                status: 500,
            }
        );
    }
}