import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import nodemailer from "nodemailer";

export const POST = async (req: Request) => {
    try {
        const { email } = await req.json();
        if (!email) {
            return NextResponse.json({ success: false, message: 'Email is required.' }, { status: 400 });
        }
        const isUserExist = await prisma.user.findUnique({
            where: { email }
        })

        if (isUserExist && isUserExist.password) {
            return NextResponse.json({ message: 'User already exists. Login instead.' }, { status: 409 });
        }

        const otp = randomInt(100000, 999999).toString();

        await prisma.user.upsert({
            where: { email },
            update: {
                otp,
                otpExpiry: new Date(Date.now() + 2 * 60 * 1000)
            },
            create: {
                name: "",
                email,
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
                <div style="font-family: monospace;">
                    <h2>Your OTP Code</h2>
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
