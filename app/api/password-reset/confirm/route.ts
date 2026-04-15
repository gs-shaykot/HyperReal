import prisma from "@/lib/prisma";
import { otpVerifyLimiter } from "@/lib/upstash";
import argon2 from "argon2";
import { NextResponse } from "next/server";
import validator from "validator";

export const POST = async (req: Request) => {
    try {
        const { email, otp, password } = await req.json();

        if (!email || !validator.isEmail(email)) {
            return NextResponse.json(
                { success: false, message: "A valid email is required." },
                { status: 400 }
            );
        }

        const limit = await otpVerifyLimiter.limit(`reset-confirm:${email}`);

        if (!limit.success) {
            return NextResponse.json(
                { message: "Too many attempts. Try again later." },
                { status: 429 }
            );
        }

        if (!otp || String(otp).length !== 6) {
            return NextResponse.json(
                { success: false, message: "A valid 6-digit reset code is required." },
                { status: 400 }
            );
        }

        if (
            !password ||
            !validator.isStrongPassword(password, {
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Password must be strong (8+ chars, uppercase, lowercase, number, symbol).",
                },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!existingUser || !existingUser.otp) {
            return NextResponse.json(
                { success: false, message: "Request a new reset code first." },
                { status: 400 }
            );
        }

        if (existingUser.otp !== otp) {
            return NextResponse.json(
                { success: false, message: "Invalid reset code. Please try again." },
                { status: 400 }
            );
        }

        if (!existingUser.otpExpiry || new Date() > existingUser.otpExpiry) {
            return NextResponse.json(
                { success: false, message: "Reset code has expired. Please request a new one." },
                { status: 400 }
            );
        }

        const hashedPassword = await argon2.hash(password);

        await prisma.user.update({
            where: { email: email.toLowerCase() },
            data: {
                password: hashedPassword,
                otp: null,
                otpExpiry: null,
                isVerified: true,
            },
        });

        return NextResponse.json(
            { success: true, message: "Password reset successfully." },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "Failed to reset password." },
            { status: 500 }
        );
    }
};
