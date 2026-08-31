import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user.id) {
            return NextResponse.json({ success: false, message: 'User not authenticated.' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user?.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                PhotoUrl: true,
                role: true,
                authProvider: true,
            },
        })
        return NextResponse.json({ success: true, profile: user }, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: 'Failed to fetch profile.' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user.id) {
            return NextResponse.json({ success: false, message: 'User not authenticated.' }, { status: 401 });
        }

        const { name, email, phone, otp } = await req.json();
        const normalizedEmail = email?.toLowerCase();

        if (!normalizedEmail || !name || !phone) {
            return NextResponse.json({ success: false, message: 'Name, email and phone are required.' }, { status: 400 });
        }

        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!currentUser) {
            return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
        }

        const emailChanged = currentUser.email.toLowerCase() !== normalizedEmail;

        if (emailChanged) {
            if (!otp || String(otp).length !== 6) {
                return NextResponse.json({ success: false, message: 'A valid 6-digit OTP is required to change your email.' }, { status: 400 });
            }

            if (!currentUser.otp || currentUser.otp !== String(otp)) {
                return NextResponse.json({ success: false, message: 'Invalid OTP. Please try again.' }, { status: 400 });
            }

            if (!currentUser.otpExpiry || new Date() > new Date(currentUser.otpExpiry)) {
                return NextResponse.json({ success: false, message: 'OTP has expired. Please request a new one.' }, { status: 400 });
            }

            const existingUser = await prisma.user.findUnique({
                where: { email: normalizedEmail },
            });

            if (existingUser && existingUser.id !== session.user.id) {
                return NextResponse.json({ success: false, message: 'Email is already in use by another user.' }, { status: 400 });
            }
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name,
                email: normalizedEmail,
                phone,
                ...(emailChanged ? { otp: null, otpExpiry: null } : {}),
            }
        });

        return NextResponse.json({ success: true, message: 'Profile updated successfully.' }, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: 'Profile update failed.' }, { status: 500 });
    }
}