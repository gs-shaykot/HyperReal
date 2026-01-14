import prisma from '@/lib/prisma';
import argon2 from 'argon2';
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { name, email, password, role, PhotoUrl } = await req.json();

        const hashPassword = await argon2.hash(password);

        const submitUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashPassword,
                role,
                PhotoUrl
            }
        })
        console.log('User creation check:', submitUser);
        return NextResponse.json({ submitUser }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ success: false, message: 'Registration failed.' }, { status: 500 });
    }
}