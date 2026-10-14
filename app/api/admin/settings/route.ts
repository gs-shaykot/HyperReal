
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

async function isAdmin() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) return false;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, isBlocked: true },
    });

    return user?.role === "ADMIN" && !user.isBlocked;
}

export async function GET() {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const settings = await prisma.storeSettings.upsert({
            where: { id: "default" },
            create: { id: "default" },
            update: {},
        });

        return NextResponse.json({ data: settings });
    } catch {
        return NextResponse.json(
            { message: "Failed to fetch settings" },
            { status: 500 }
        );
    }
}

export async function PUT(req: Request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();

        const data: Record<string, unknown> = {};

        const stringFields = [
            "storeName",
            "supportEmail",
            "releaseNameLine1",
            "releaseNameLine2",
            "releaseVersion",
            "releaseDescription",
            "releaseButtonLabel",
        ] as const;

        for (const field of stringFields) {
            if (typeof body[field] === "string") {
                data[field] = body[field].trim();
            }
        }

        if (typeof body.showMarquee === "boolean") {
            data.showMarquee = body.showMarquee;
        }

        if (typeof body.showUpcomingRelease === "boolean") {
            data.showUpcomingRelease = body.showUpcomingRelease;
        }

        if (Array.isArray(body.marqueeMessages)) {
            if (
                !body.marqueeMessages.every(
                    (message: unknown) =>
                        typeof message === "string" &&
                        message.trim().length > 0
                )
            ) {
                return NextResponse.json(
                    { message: "Every marquee message must contain text." },
                    { status: 400 }
                );
            }

            data.marqueeMessages = body.marqueeMessages.map(
                (message: string) => message.trim()
            );
        }

        if (body.marqueeScrollSpeed !== undefined) {
            const speed = Number(body.marqueeScrollSpeed);

            if (!Number.isInteger(speed) || speed < 10 || speed > 120) {
                return NextResponse.json(
                    { message: "Scroll speed must be between 10 and 120." },
                    { status: 400 }
                );
            }

            data.marqueeScrollSpeed = speed;
        }

        if (body.releaseCountdownEnds !== undefined) {
            if (body.releaseCountdownEnds === null || body.releaseCountdownEnds === "") {
                data.releaseCountdownEnds = null;
            } else {
                const date = new Date(body.releaseCountdownEnds);

                if (!Number.isFinite(date.getTime())) {
                    return NextResponse.json(
                        { message: "Invalid release countdown date." },
                        { status: 400 }
                    );
                }

                data.releaseCountdownEnds = date;
            }
        }

        const settings = await prisma.storeSettings.upsert({
            where: { id: "default" },
            create: { id: "default", ...data },
            update: data,
        });

        return NextResponse.json({
            success: true,
            data: settings,
        });
    } catch {
        return NextResponse.json(
            { message: "Failed to save settings" },
            { status: 500 }
        );
    }
}
