import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getDiscount } from "@/lib/Discount_Calculation_funcs";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const { code } = await req.json();
        console.log("Received coupon code:", code);

        if (!code || typeof code !== "string") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Coupon code is required",
                },
                { status: 400 }
            );
        }

        const coupon = await prisma.coupon.findUnique({
            where: {
                code: code.trim().toUpperCase(),
            },
        });

        if (!coupon) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid coupon code",
                },
                { status: 400 }
            );
        }

        if (
            coupon.expiryDate &&
            coupon.expiryDate < new Date()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This coupon has expired",
                },
                { status: 400 }
            );
        }

        if (
            coupon.newUserOnly &&
            session.user.isNewUser !== true
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This coupon is for new users only",
                },
                { status: 400 }
            );
        }

        if (
            coupon.limit !== null && coupon.usedCount >= coupon.limit
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This coupon has reached its usage limit",
                },
                { status: 400 }
            );
        }

        const cart = await prisma.cart.findUnique({
            where: {
                userId: session.user.id,
            },
            include: {
                cartItems: {
                    include: {
                        variant: {
                            include: {
                                product: true,
                            },
                        },
                    },
                },
            },
        });

        const subtotal =
            cart?.cartItems.reduce(
                (total, item) =>
                    total +
                    item.quantity *
                    item.variant.product.price,
                0
            ) ?? 0;

        if (
            coupon.minSpend !== null &&
            subtotal < coupon.minSpend
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Minimum purchase of $${coupon.minSpend} is required for this coupon`,
                },
                { status: 400 }
            );
        }

        const discount = getDiscount(
            coupon,
            subtotal,
            session.user.isNewUser === true
        );

        return NextResponse.json({
            success: true,
            message: `${coupon.code} applied successfully`,
            data: {
                coupon,
                discount,
                subtotal,
            },
        });

    } catch (error) {
        console.error("Coupon validation error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to validate coupon",
            },
            { status: 500 }
        );
    }
}