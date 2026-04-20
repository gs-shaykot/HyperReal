import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { variantId, quantity } = await req.json();

        let cart = await prisma.cart.findUnique({
            where: { userId: session.user.id }
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: {
                    userId: session.user.id,
                }
            })
        }

        const cartId = cart.id;

        const existingCart = await prisma.cartItem.findUnique({
            where: {
                cartId_variantId: {
                    cartId,
                    variantId,
                }
            }
        });

        if (existingCart) {
            await prisma.cartItem.update({
                where: { id: existingCart.id },
                data: {
                    quantity: existingCart.quantity + quantity,
                }
            })
        }
        else {
            await prisma.cartItem.create({
                data: {
                    cartId,
                    variantId,
                    quantity,
                }
            })
        }

        return NextResponse.json({ success: true, message: "Item added to cart" }, { status: 200 });
    }
    catch (error: unknown) {

        return NextResponse.json({ success: false, message: "Failed to add item to cart" }, { status: 500 });
    }
}

export async function GET() {
    try {
        console.log("cartItems GET HIT")
        const session = await getServerSession(authOptions);
        if (!session?.user.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const cart = await prisma.cart.findUnique({
            where: { userId: session.user.id },
            select: {
                cartItems: {
                    select: {
                        id: true,
                        cartId: true,
                        variantId: true,
                        quantity: true,
                        variant: {
                            select: {
                                size: true,
                                color: true,
                                product: {
                                    select: {
                                        name: true,
                                        price: true,
                                        isAvailable: true,
                                        category: {
                                            select: {
                                                name: true
                                            }
                                        },
                                        productImages: {
                                            select: {
                                                imageUrl: true,
                                                color: true,
                                            }
                                        }
                                    },

                                }
                            }
                        }
                    }
                }
            }
        })


        return NextResponse.json({ success: true, data: cart?.cartItems ?? [] }, { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ success: false, message: "Failed to fetch cart" }, { status: 500 });
    }
}
