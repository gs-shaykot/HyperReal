import prisma from '@/lib/prisma';
import argon2 from 'argon2';
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { name, email, password, role, PhotoUrl } = await req.json();

        const isUserExist = await prisma.user.findUnique({
            where: { email }
        })

        if (isUserExist) {
            return NextResponse.json({ success: false, message: 'User already exists.' }, { status: 400 });
        }

        const hashPassword = await argon2.hash(password);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashPassword,
                role,
                PhotoUrl
            }
        })

        return NextResponse.json({ success: true, message: 'User registered successfully.'}, { status: 201 });

    } catch (error) {
        return NextResponse.json({ success: false, message: 'Registration failed.' }, { status: 500 });
    }
}