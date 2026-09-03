import { hashSessionId } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
    });

    if (token?.sessionId) {
        const currentSessionHash = hashSessionId(
            token.sessionId
        );

        const sessionRecord = await prisma.session.findFirst({
            where: {
                tokenHash: currentSessionHash,
                expiresAt: {
                    gt: new Date(),
                },
                sessionRevoked: false,
            },
        });

        if (!sessionRecord) {
            const response = NextResponse.redirect(
                new URL("/login", request.url)
            );

            response.cookies.delete(
                "next-auth.session-token"
            );

            response.cookies.delete(
                "__Secure-next-auth.session-token"
            );

            return response;
        }

        return NextResponse.next();
    }

    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set(
        "callbackUrl",
        `${request.nextUrl.pathname}${request.nextUrl.search}`
    );

    return NextResponse.redirect(loginUrl);
}

export const config = {
    matcher: [
        "/account/:path*",
        "/cart/:path*",
        "/checkout/:path*",
        "/success/:path*",
        "/failed/:path*",
        "/cancel/:path*",
    ],
};