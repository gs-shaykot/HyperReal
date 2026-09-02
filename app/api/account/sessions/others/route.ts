import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function DELETE() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || !session.sessionId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const currentSessionHash = crypto
            .createHash("sha256")
            .update(session.sessionId)
            .digest("hex");

        const result = await prisma.session.deleteMany({
            where: {
                userId: session.user.id,
                tokenHash: {
                    not: currentSessionHash,
                },
            },
        });

        return NextResponse.json({
            success: true,
            deletedCount: result.count,
        });
    } catch (error) {
        console.error(
            "DELETE /account/sessions/others:",
            error
        );

        return NextResponse.json(
            { message: "Failed to logout other sessions" },
            { status: 500 }
        );
    }
}