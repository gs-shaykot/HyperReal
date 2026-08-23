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
        console.log("Received data:", { variantId, quantity });

        if (!variantId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Variant id is required",
                },
                { status: 400 }
            );
        }

        if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity <= 0) {
            return NextResponse.json(
                { success: false, message: "Quantity must be a positive integer" }, { status: 400 }
            );
        }

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

        const variant = await prisma.productVariant.findUnique({
            where: {
                id: variantId
            },
            include: {
                product: true
            }
        })

        if (!variant) {
            return NextResponse.json({ success: false, message: "Selected variant is not available" }, { status: 400 });
        }

        if (!variant.product.isAvailable) {
            return NextResponse.json({ success: false, message: "Associated product is not available" }, { status: 400 });
        }

        const existingCart = await prisma.cartItem.findUnique({
            where: {
                cartId_variantId: {
                    cartId,
                    variantId,
                }
            }
        });

        const newQuantity = existingCart ? existingCart.quantity + quantity : quantity;

        if (newQuantity > variant.stock) {
            return NextResponse.json({ success: false, message: "Requested quantity exceeds available stock" }, { status: 400 });
        }

            if (existingCart) {
                await prisma.cartItem.update({
                    where: { id: existingCart.id },
                    data: {
                        quantity: newQuantity,
                    }
                })
            }
            else {
                await prisma.cartItem.create({
                    data: {
                        cartId,
                        variantId,
                        quantity: newQuantity,
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
                                        id: true,
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

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { itemId } = await req.json();

        if (!itemId) {
            return NextResponse.json({ success: false, message: "Item id is required" }, { status: 400 });
        }

        const cart = await prisma.cart.findUnique({
            where: { userId: session.user.id },
            select: { id: true },
        });

        if (!cart) {
            return NextResponse.json({ success: false, message: "Cart not found" }, { status: 404 });
        }

        const deleted = await prisma.cartItem.deleteMany({
            where: {
                id: itemId,
                cartId: cart.id,
                cart: {
                    userId: session.user.id
                }
            }
        });

        if (deleted.count === 0) {
            return NextResponse.json({ success: false, message: "Item not found or not authorized to delete" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Item removed from cart" }, { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ success: false, message: "Failed to remove item from cart" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { itemId, quantity } = await req.json();

        if (!itemId) {
            return NextResponse.json({ success: false, message: "Item id is required" }, { status: 400 });
        }

        const cart = await prisma.cart.findUnique({
            where: { userId: session.user.id },
            select: { id: true },
        });

        if (!cart) {
            return NextResponse.json({ success: false, message: "Cart not found" }, { status: 404 });
        }

        const updateCartItem = await prisma.cartItem.updateMany({
            where: {
                id: itemId,
                cartId: cart.id,
                cart: {
                    userId: session.user.id
                }
            },
            data: {
                quantity,
            }
        });

        if (updateCartItem.count === 0) {
            return NextResponse.json({ success: false, message: "Item not found or not authorized to update" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Cart item updated" }, { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ success: false, message: "Failed to update cart item" }, { status: 500 });
    }
}