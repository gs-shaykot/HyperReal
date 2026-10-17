
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const DEFAULT_SETTINGS = {
    id: "homepage",
    isEnabled: true,
    nameLine1: "Void",
    nameLine2: "Runner",
    version: "V3",
    description: "The next iteration of urban mobility.",
    countdownEnds: null,
    buttonLabel: "Set Reminder",
};

async function isAdmin() {
    const session = await getServerSession(authOptions);
    return session?.user?.role === "ADMIN";
}

async function getOrCreateRelease() {
    return prisma.upcomingRelease.upsert({
        where: { id: "homepage" },
        update: {},
        create: DEFAULT_SETTINGS,
    });
}

export async function GET() {
    try {
        const settings = await getOrCreateRelease();

        return NextResponse.json(
            { success: true, data: settings },
            {
                status: 200,
                headers: { "Cache-Control": "no-store" },
            }
        );
    } catch (error) {
        console.error("Get upcoming release error:", error);

        return NextResponse.json(
            { message: "Failed to fetch upcoming release settings." },
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

        const {
            isEnabled,
            nameLine1,
            nameLine2,
            version,
            description,
            countdownEnds,
            buttonLabel,
        } = body;

        if (typeof isEnabled !== "boolean") {
            return NextResponse.json(
                { message: "Invalid section visibility setting." },
                { status: 400 }
            );
        }

        const textFields = [
            { name: "Name Line 1", value: nameLine1, max: 80 },
            { name: "Name Line 2", value: nameLine2, max: 80 },
            { name: "Version", value: version, max: 30 },
            { name: "Description", value: description, max: 1000 },
            { name: "Button Label", value: buttonLabel, max: 60 },
        ];

        for (const field of textFields) {
            if (
                typeof field.value !== "string" ||
                field.value.trim().length === 0 ||
                field.value.trim().length > field.max
            ) {
                return NextResponse.json(
                    {
                        message: `${field.name} is required and must be no longer than ${field.max} characters.`,
                    },
                    { status: 400 }
                );
            }
        }

        let parsedCountdown: Date | null = null;

        if (countdownEnds !== null && countdownEnds !== "") {
            if (
                typeof countdownEnds !== "string" ||
                Number.isNaN(Date.parse(countdownEnds))
            ) {
                return NextResponse.json(
                    { message: "Please provide a valid countdown date." },
                    { status: 400 }
                );
            }

            parsedCountdown = new Date(countdownEnds);
        }

        const data = {
            isEnabled,
            nameLine1: nameLine1.trim(),
            nameLine2: nameLine2.trim(),
            version: version.trim(),
            description: description.trim(),
            countdownEnds: parsedCountdown,
            buttonLabel: buttonLabel.trim(),
        };

        const settings = await prisma.upcomingRelease.upsert({
            where: { id: "homepage" },
            update: data,
            create: {
                id: "homepage",
                ...data,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Upcoming release settings saved successfully.",
            data: settings,
        });
    } catch (error) {
        console.error("Update upcoming release error:", error);

        return NextResponse.json(
            { message: "Failed to save upcoming release settings." },
            { status: 500 }
        );
    }
}
