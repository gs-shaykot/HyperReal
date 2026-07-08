import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
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

        const { name, email, phone } = await req.json();

        if (!email || !name || !phone) {
            return NextResponse.json({ success: false, message: 'Name, email and phone are required.' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        })

        if (existingUser && existingUser.id !== session.user.id) {
            return NextResponse.json({ success: false, message: 'Email is already in use by another user.' }, { status: 400 });
        }


        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name,
                email: email.toLowerCase(),
                phone,
            }
        });

        return NextResponse.json({ success: true, message: 'Profile updated successfully.' }, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: 'Profile update failed.' }, { status: 500 });
    }
}