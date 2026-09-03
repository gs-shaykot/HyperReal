import crypto from "crypto";
import prisma from "@/lib/prisma";

export function hashSessionId(sessionId: string) {
    return crypto
        .createHash("sha256")
        .update(sessionId)
        .digest("hex");
}

export async function createSessionRecord(userId: string) {
    const sessionId = crypto.randomUUID();

    const tokenHash = hashSessionId(sessionId);

    const expiresAt = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
    );

    const session = await prisma.session.create({
        data: {
            userId,
            tokenHash,
            expiresAt,
        },
    });

    return {
        sessionId,
        session,
    };
}