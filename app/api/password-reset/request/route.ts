import prisma from "@/lib/prisma";
import { randomInt } from "crypto";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import validator from "validator";
import { otpLimiter } from "@/lib/upstash";

export const POST = async (req: Request) => {
    try {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
        const { email } = await req.json();

        if (!email || !validator.isEmail(email)) {
            return NextResponse.json(
                { success: false, message: "A valid email is required." },
                { status: 400 }
            );
        }
 
        const ipLimit = await otpLimiter.limit(`reset:${ip}`);
        if (!ipLimit.success) {
            return NextResponse.json({ message: "Too many requests." }, { status: 429 });
        }
 
        const emailLimit = await otpLimiter.limit(`reset:${email}`);
        if (!emailLimit.success) {
            return NextResponse.json({ message: "Too many reset attempts." }, { status: 429 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!existingUser) {
            return NextResponse.json(
                { success: false, message: "No account found with this email." },
                { status: 404 }
            );
        }

        const otp = randomInt(100000, 999999).toString();
        const otpExpiry = new Date(Date.now() + 2 * 60 * 1000);

        await prisma.user.update({
            where: { email: email.toLowerCase() },
            data: {
                otp,
                otpExpiry,
            },
        });

        const emailSender = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        await emailSender.sendMail({
            from: `"Hyperreal" <${process.env.EMAIL_USER}>`,
            to: email.toLowerCase(),
            subject: "Your Hyperreal password reset code",
            html: `
                <div style="font-family:monospace;background:#09090b;color:#a3e635;padding:32px;border-radius:8px">
                    <h2 style="letter-spacing:4px">&gt;_ SYSTEM MESSAGE</h2>
                    <p style="color:#a1a1aa">&gt; PASSCODE_RESET_REQUESTED</p>
                    <p>Use the verification code below to reset your password.</p>
                    <h1 style="letter-spacing: 5px;">${otp}</h1>
                    <p>This code expires in 2 minutes.</p>
                    <p style="color:#52525b;font-size:12px">&gt; If you did not request this, ignore this message.</p>
                </div>
            `,
        });

        return NextResponse.json(
            { success: true, message: "Reset code sent successfully. Please check your email." },
            { status: 200 }
        );
    } catch {
        return NextResponse.json(
            { success: false, message: "Failed to send reset code." },
            { status: 500 }
        );
    }
};
