import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";

export async function requireSession(callbackUrl?: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.sessionRevoked) { 
        const loginUrl = callbackUrl
            ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
            : "/login";

        redirect(loginUrl);
    }

    return session;
}