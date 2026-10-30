
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const DEFAULT_MESSAGES = [
    "FREE SHIPPING WORLDWIDE",
    "DROP 004 AVAILABLE NOW",
    "LIMITED STOCK",
];

const DEFAULT_SETTINGS = {
    id: "homepage",
    messages: DEFAULT_MESSAGES,
    isEnabled: true,
    scrollSpeed: 45,
};

async function isAdmin() {
    const session = await getServerSession(authOptions);
    return session?.user?.role === "ADMIN";
}

async function getOrCreateMarquee() {
    return prisma.homepageMarquee.upsert({
        where: { id: "homepage" },
        update: {},
        create: DEFAULT_SETTINGS,
    });
}

// Public: the storefront needs to read the announcement settings.
export async function GET() {
    try {
        const settings = await getOrCreateMarquee();

        return NextResponse.json(
            { success: true, data: settings },
            {
                status: 200,
                headers: {
                    "Cache-Control": "no-store",
                },
            }
        );
    } catch (error) {

        return NextResponse.json(
            { message: "Failed to fetch marquee settings." },
            { status: 500 }
        );
    }
}

// Admin-only: only administrators can modify the settings.
export async function PUT(req: Request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { messages, isEnabled, scrollSpeed } = body;

        if (
            !Array.isArray(messages) ||
            messages.length > 10 ||
            messages.some(
                (message: unknown) =>
                    typeof message !== "string" ||
                    message.trim().length === 0 ||
                    message.trim().length > 200
            )
        ) {
            return NextResponse.json(
                {
                    message:
                        "Messages must contain up to 10 non-empty entries, each no longer than 200 characters.",
                },
                { status: 400 }
            );
        }

        if (typeof isEnabled !== "boolean") {
            return NextResponse.json(
                { message: "Invalid enabled setting." },
                { status: 400 }
            );
        }

        if (
            !Number.isInteger(scrollSpeed) ||
            scrollSpeed < 15 ||
            scrollSpeed > 120
        ) {
            return NextResponse.json(
                { message: "Scroll speed must be between 15 and 120." },
                { status: 400 }
            );
        }

        const data = {
            messages: messages.map((message: string) => message.trim()),
            isEnabled,
            scrollSpeed,
        };

        const settings = await prisma.homepageMarquee.upsert({
            where: { id: "homepage" },
            update: data,
            create: {
                id: "homepage",
                ...data,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Marquee settings saved successfully.",
                data: settings,
            },
            { status: 200 }
        );
    } catch (error) {

        return NextResponse.json(
            { message: "Failed to save marquee settings." },
            { status: 500 }
        );
    }
}
