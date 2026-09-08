import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export async function requireSession(callbackUrl?: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.sessionRevoked) {
        const params = new URLSearchParams();

        params.set("sessionRevoked", "true");

        if (callbackUrl) {
            params.set("callbackUrl", callbackUrl);
        }
        redirect(`/login?${params.toString()}`);
    }

    return session;
}