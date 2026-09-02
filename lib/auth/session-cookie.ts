import { cookies } from "next/headers";

const SESSION_COOKIE = "session";

export async function setSessionCookie(token: string) {
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
    });
} 