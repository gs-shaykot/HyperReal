import prisma from "@/lib/prisma";
import { NextResponse } from "next/server"; 
import { randomInt } from "crypto";

export const POST = async (req: Request) => {
    try {
        const { email, password } = await req.json();
        if (!email) {
            return NextResponse.json({ success: false, message: 'Email is required.' }, { status: 400 });
        }
        const isUserExist = await prisma.user.findUnique({
            where: { email }
        })
        if (!isUserExist) {
            return NextResponse.json({ success: false, message: 'User already exists. Please login.' }, { status: 404 });
        }

        // const generatedOtp = customAlphabet('0123456789', 6);
        const otp = randomInt(100000, 999999).toString();
        
    }
    catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to send OTP.' }, { status: 500 });
    }

}
