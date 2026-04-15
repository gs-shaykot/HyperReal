import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import nodemailer from "nodemailer";
import { otpLimiter } from "@/lib/upstash";

export const POST = async (req: Request) => {
    try {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ success: false, message: 'Email is required.' }, { status: 400 });
        }

        const ipLimit = await otpLimiter.limit(`sendOtp:${ip}`);
        if (!ipLimit.success) {
            return NextResponse.json({ success: false, message: 'Too many requests. Please try again later.' }, { status: 429 });
        }

        const emailLimit = await otpLimiter.limit(`sendOtp:${email.toLowerCase()}`);
        if (!emailLimit.success) {
            return NextResponse.json({ success: false, message: 'Too many requests for this email.' }, { status: 429 });
        }

        const isUserExist = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        })

        if (isUserExist && isUserExist.password) {
            return NextResponse.json({ message: 'User already exists. Login instead.' }, { status: 409 });
        }

        const otp = randomInt(100000, 999999).toString();

        await prisma.user.upsert({
            where: { email: email.toLowerCase() },
            update: {
                otp,
                otpExpiry: new Date(Date.now() + 2 * 60 * 1000)
            },
            create: {
                name: "",
                email: email.toLowerCase(),
                password: "",
                role: "USER",
                PhotoUrl: "",
                otp,
                otpExpiry: new Date(Date.now() + 2 * 60 * 1000)
            }
        });

        const emailSender = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        await emailSender.sendMail({
            from: `"Hyperreal" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your OTP for Hyperreal Login',
            html: `
                <div style="font-family:monospace;background:#09090b;color:#a3e635;padding:32px;border-radius:8px">
                 <h2 style="letter-spacing:4px">&gt;_ SYSTEM MESSAGE</h2>
                 <p style="color:#a1a1aa">&gt; OTP YOU_REQUESTED</p>
                 <p>Use the verification code below to verify your account.</p>
                    <h1 style="letter-spacing: 5px;">${otp}</h1>
                    <p>This code expires in 2 minutes.</p>
                </div>
            `
        })

        return NextResponse.json({ success: true, message: 'OTP sent successfully. Please check your email.' }, { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to send OTP.' }, { status: 500 });
    }

}
