import prisma from '@/lib/prisma';
import argon2 from 'argon2';
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { name, email, password, role, PhotoUrl, otp } = await req.json();

        const isUserExist = await prisma.user.findUnique({
            where: { email }
        })

        if (!isUserExist || !isUserExist.otp) {
            return NextResponse.json({ message: 'Request OTP first' }, { status: 400 });
        }

        if (isUserExist.otp !== otp) {
            return NextResponse.json({ success: false, message: 'Invalid OTP. Please try again.' }, { status: 400 });
        }
        if (!isUserExist.otpExpiry || new Date() > isUserExist.otpExpiry) {
            return NextResponse.json({ success: false, message: 'OTP has expired. Please request a new OTP.' }, { status: 400 });
        }

        const hashPassword = await argon2.hash(password);

        const newUser = await prisma.user.update({
            where: { email },
            data: {
                name,
                email,
                password: hashPassword,
                role,
                PhotoUrl,
                otp: null,
                otpExpiry: null
            }
        });

        return NextResponse.json({ success: true, message: 'User registered successfully.' }, { status: 201 });

    } catch (error) {
        console.log(error)
        return NextResponse.json({ success: false, message: 'Registration failed.' }, { status: 500 });
    }
}