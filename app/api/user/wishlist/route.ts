import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { productId } = await req.json();
        console.log("Received productId for wishlist in API: ", productId);
        if (!session?.user.id) {
            return NextResponse.json({ success: false, message: 'User not authenticated.' }, { status: 401 });
        }
        if (!productId) {
            return NextResponse.json({ success: false, message: 'Product ID is required.' }, { status: 400 });
        }
        const wishlistItem = await prisma.wishlist.create({
            data: {
                userId: session.user.id,
                productId: productId,
            }
        });

        return NextResponse.json({ success: true, data: wishlistItem }, { status: 201 });
    }
    catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: 'Failed to create wishlist item.' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user.id) {
            return NextResponse.json({ success: false, message: 'User not authenticated.' }, { status: 401 });
        }
        const wishlistItems = await prisma.wishlist.findMany({
            where: { userId: session.user.id },
        });

        return NextResponse.json({ success: true, data: wishlistItems }, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: 'Failed to fetch wishlist items.' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { productId } = await req.json();
        const res = await prisma.wishlist.deleteMany({
            where: {
                userId: session?.user.id,
                productId: productId,
            },
        });
        return NextResponse.json({ success: true, message: 'Wishlist item deleted successfully.' }, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: 'Failed to delete wishlist item.' }, { status: 500 });
    }
}