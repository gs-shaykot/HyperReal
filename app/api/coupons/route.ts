import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        const coupons = await prisma.coupon.findMany();

        return NextResponse.json({ success: true, data: coupons }, { status: 200 });
    }
    catch (error: unknown) {
        return NextResponse.json({ success: false, message: "Failed to fetch coupons" }, { status: 500 });
    }
}