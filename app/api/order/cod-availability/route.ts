import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                isBlocked: true,
                isCODDisabled: true,
            },
        });

        if (!user || user.isBlocked) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        return NextResponse.json({
            isCODDisabled: user.isCODDisabled,
        });
    } catch (error) {
        console.error("COD availability check failed:", error);

        return NextResponse.json(
            { message: "Failed to check COD availability" },
            { status: 500 }
        );
    }
}