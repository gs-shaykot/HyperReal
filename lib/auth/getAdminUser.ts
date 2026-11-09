import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export type AdminUser = {
    id: string;
    role: "ADMIN";
};

/**
 * Resolve admin authorization from the current database state.
 * Never trust the role stored in a potentially stale JWT.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.sessionRevoked) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, role: true, isBlocked: true },
    });

    if (!user || user.role !== "ADMIN" || user.isBlocked) {
        return null;
    }

    return { id: user.id, role: "ADMIN" };
}
