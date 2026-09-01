import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import argon2 from 'argon2';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        const { currentPassword, newPassword } = await request.json();
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { password: true },
        });

        const isPasswordValid = await argon2.verify(user?.password ?? "", currentPassword);

        if (!isPasswordValid) {
            return NextResponse.json({ success: false, message: "Current password is incorrect" }, { status: 400 });
        }

        const hashedNewPassword = await argon2.hash(newPassword);
        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedNewPassword },
        });

        return NextResponse.json({ success: true, message: "Password changed successfully" }, { status: 200 });
    }
    catch (error) {
        console.log(error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong." }, { status: 500 })
    }
}