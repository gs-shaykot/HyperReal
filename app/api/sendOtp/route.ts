import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import nodemailer from "nodemailer";
import { emailLimiter, ipLimiter } from "@/lib/upstash";

export const POST = async (req: Request) => {
    try {
        console.log("[sendOtp] start request");

        const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
        console.log("[sendOtp] request ip:", ip);

        const body = await req.json();
        const { email } = body;
        console.log("[sendOtp] received email:", email);

        if (!email) {
            console.log("[sendOtp] missing email");
            return NextResponse.json({ success: false, message: 'Email is required.' }, { status: 400 });
        }

        console.log("[sendOtp] checking IP rate limit");
        const ipLimit = await ipLimiter.limit(`sendOtp:${ip}`);
        console.log("[sendOtp] IP limit result:", ipLimit);
        if (!ipLimit.success) {
            return NextResponse.json({ success: false, message: 'Too many requests. Please try again later.' }, { status: 429 });
        }

        console.log("[sendOtp] checking email rate limit");
        const emailLimit = await emailLimiter.limit(`sendOtp:${email.toLowerCase()}`);
        console.log("[sendOtp] email limit result:", emailLimit);

        if (!emailLimit.success) {
            return NextResponse.json({ success: false, message: 'Too many requests for this email.' }, { status: 429 });
        }

        console.log("[sendOtp] checking if user exists for:", email.toLowerCase());
        const isUserExist = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });
        console.log("[sendOtp] user lookup result:", isUserExist ? { email: isUserExist.email, hasPassword: !!isUserExist.password } : null);

        if (isUserExist && isUserExist.password) {
            console.log("[sendOtp] user already exists with password");
            return NextResponse.json({ message: 'User already exists. Login instead.' }, { status: 409 });
        }

        const otp = randomInt(100000, 999999).toString();
        console.log("[sendOtp] generated otp:", otp);

        console.log("[sendOtp] upserting user record");
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
        console.log("[sendOtp] user upsert successful");

        console.log("[sendOtp] creating nodemailer transport");
        const emailSender = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        console.log("[sendOtp] sending email to:", email);
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
        });
        console.log("[sendOtp] email sent successfully");

        return NextResponse.json({ success: true, message: 'OTP sent successfully. Please check your email.' }, { status: 200 });
    }
    catch (error) {
        console.error("[sendOtp] failed at some stage:", error);
        if (error instanceof Error) {
            console.error("[sendOtp] error name:", error.name);
            console.error("[sendOtp] error message:", error.message);
            console.error("[sendOtp] error stack:", error.stack);
        }
        return NextResponse.json({ success: false, message: 'Failed to send OTP.' }, { status: 500 });
    }

}
