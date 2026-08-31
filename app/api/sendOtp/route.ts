import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import nodemailer from "nodemailer";
import validator from "validator";
import { emailLimiter, ipLimiter } from "@/lib/upstash";

export const POST = async (req: Request) => {
    try {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
        const body = await req.json();
        const { email, purpose = "REGISTER", userId } = body;

        if (!email || !validator.isEmail(email)) {
            return NextResponse.json({ success: false, message: 'A valid email is required.' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase();

        const ipLimit = await ipLimiter.limit(`sendOtp:${ip}`);
        if (!ipLimit.success) {
            return NextResponse.json({ success: false, message: 'Too many requests. Please try again later.' }, { status: 429 });
        }

        const emailLimit = await emailLimiter.limit(`sendOtp:${normalizedEmail}`);
        if (!emailLimit.success) {
            return NextResponse.json({ success: false, message: 'Too many requests for this email.' }, { status: 429 });
        }

        const otp = randomInt(100000, 999999).toString();
        const otpExpiry = new Date(Date.now() + 2 * 60 * 1000);

        if (purpose === "PROFILE_UPDATE") {
            if (!userId) {
                return NextResponse.json({ success: false, message: 'User context is required for email verification.' }, { status: 400 });
            }

            const currentUser = await prisma.user.findUnique({ where: { id: userId } });
            if (!currentUser) {
                return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
            }

            if (currentUser.email.toLowerCase() === normalizedEmail) {
                return NextResponse.json({ success: false, message: 'This is already your current email.' }, { status: 400 });
            }

            const targetUser = await prisma.user.findUnique({
                where: { email: normalizedEmail }
            });

            if (targetUser && targetUser.id !== userId) {
                return NextResponse.json({ success: false, message: 'Email is already in use by another user.' }, { status: 409 });
            }

            await prisma.user.update({
                where: { id: userId },
                data: { otp, otpExpiry }
            });
        } else {
            const isUserExist = await prisma.user.findUnique({
                where: { email: normalizedEmail }
            });

            if (isUserExist && isUserExist.password) {
                return NextResponse.json({ message: 'User already exists. Login instead.' }, { status: 409 });
            }

            await prisma.user.upsert({
                where: { email: normalizedEmail },
                update: {
                    otp,
                    otpExpiry,
                },
                create: {
                    name: "",
                    email: normalizedEmail,
                    password: "",
                    role: "USER",
                    PhotoUrl: "",
                    otp,
                    otpExpiry,
                }
            });
        }

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
            subject: purpose === "PROFILE_UPDATE" ? 'Verify your new Hyperreal email' : 'Your OTP for Hyperreal Login',
            html: `
                <div style="font-family:monospace;background:#09090b;color:#a3e635;padding:32px;border-radius:8px">
                 <h2 style="letter-spacing:4px">&gt;_ SYSTEM MESSAGE</h2>
                 <p style="color:#a1a1aa">&gt; ${purpose === "PROFILE_UPDATE" ? "EMAIL_UPDATE_VERIFICATION" : "OTP YOU_REQUESTED"}</p>
                 <p>Use the verification code below to ${purpose === "PROFILE_UPDATE" ? "confirm your email change" : "verify your account"}.</p>
                    <h1 style="letter-spacing: 5px;">${otp}</h1>
                    <p>This code expires in 2 minutes.</p>
                </div>
            `
        });

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
};
