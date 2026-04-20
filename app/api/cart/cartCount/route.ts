import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const GET = async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const cart = await prisma.cart.findUnique({
            where: { userId: session.user.id },
            select: {
                _count: {
                    select: {
                        cartItems: true,
                    },
                },
            }
        });
        
        const count = cart?._count.cartItems ?? 0;

        return NextResponse.json({ success: true, data: { count } }, { status: 200 });
    }
    catch {
        return NextResponse.json({ success: false, message: "Failed to fetch cart count" }, { status: 500 });
    }
}