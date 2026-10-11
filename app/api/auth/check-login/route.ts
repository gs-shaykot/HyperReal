import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import argon2 from "argon2";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const email =
            typeof body.email === "string"
                ? body.email.trim().toLowerCase()
                : "";
        const password =
            typeof body.password === "string"
                ? body.password
                : "";

        if (!email || !password) {
            return NextResponse.json(
                { code: "INVALID_CREDENTIALS" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                password: true,
                isBlocked: true,
            },
        });

        if (!user?.password) {
            return NextResponse.json(
                { code: "INVALID_CREDENTIALS" },
                { status: 401 }
            );
        }

        const isValid = await argon2.verify(
            user.password,
            password
        );

        if (!isValid) {
            return NextResponse.json(
                { code: "INVALID_CREDENTIALS" },
                { status: 401 }
            );
        }

        if (user.isBlocked) {
            return NextResponse.json(
                { code: "ACCOUNT_BLOCKED" },
                { status: 403 }
            );
        }

        return NextResponse.json({ valid: true });
    } catch {
        return NextResponse.json(
            { code: "AUTH_SERVICE_ERROR" },
            { status: 500 }
        );
    }
}