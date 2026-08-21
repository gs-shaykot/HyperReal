import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user.id) {
            return NextResponse.json({ success: false, message: 'User not authenticated.' }, { status: 401 });
        }

        const { productId, variantId } = await req.json();

        if (!productId) {
            return NextResponse.json({ success: false, message: 'Product ID is required.' }, { status: 400 });
        }
        if (!variantId) {
            return NextResponse.json({ success: false, message: 'Product variant ID is required.' }, { status: 400 });
        }
        const wishlistItem = await prisma.wishlist.create({
            data: {
                userId: session.user.id,
                productId: productId,
                productVariantId: variantId,
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
            select: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        productImages: true,
                        category: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                variant: true
            }
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
        if (!session?.user.id) {
            return NextResponse.json({ success: false, message: 'User not authenticated.' }, { status: 401 });
        }

        const { productId, clearAll } = await req.json();
        if (clearAll) {
            await prisma.wishlist.deleteMany({
                where: {
                    userId: session.user.id,
                },
            });

            return NextResponse.json(
                {
                    success: true,
                    message: "Wishlist cleared successfully.",
                },
                { status: 200 }
            );
        }

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