
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
    getCouponValidationError,
    getDiscount,
} from "@/lib/order_helpers/Discount_Calculation_funcs";

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

        if (!code || typeof code !== "string") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Coupon code is required",
                },
                { status: 400 }
            );
        }

        const normalizedCode = code.trim().toUpperCase();

        const coupon = await prisma.coupon.findUnique({
            where: {
                code: normalizedCode,
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

        // Always use the database record rather than relying on
        // potentially stale session data.
        const user = await prisma.user.findUnique({
            where: {
                id: session.user.id,
            },
            select: {
                isNewUser: true,
                isBlocked: true,
            },
        });

        if (!user || user.isBlocked) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Your account is not authorized to use coupons.",
                },
                { status: 403 }
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
                    item.quantity * item.variant.product.price,
                0
            ) ?? 0;

        // Shared validation handles expiry, usage limit, new-user
        // eligibility, minimum spend, and discount configuration.
        const validationError = getCouponValidationError(
            coupon,
            subtotal,
            user.isNewUser
        );

        if (validationError) {
            return NextResponse.json(
                {
                    success: false,
                    message: validationError,
                },
                { status: 400 }
            );
        }

        const discount = getDiscount(
            coupon,
            subtotal,
            user.isNewUser
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

        return NextResponse.json(
            {
                success: false,
                message: "Failed to validate coupon",
            },
            { status: 500 }
        );
    }
}
