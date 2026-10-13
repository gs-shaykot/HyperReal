
import { CartItemWithProductType } from "@/app/types/cartType";
import { authOptions } from "@/lib/auth";
import { CouponError } from "@/lib/errors/CouponError";
import { generateCustomId } from "@/lib/order_helpers/generateCustomId";
import prisma from "@/lib/prisma";
import { cartItemsSelect } from "@/lib/prisma/cartItemsSelect";
import { calculateOrder } from "@/lib/service/orderService";
import { completePayment } from "@/lib/service/paymentService";
import { stripe } from "@/lib/stripe";
import axios from "axios";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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

        const body = await req.json();

        const {
            country,
            coupon,
            paymentMethod,
            address,
            saveAddress,
            deliveryOption,
        } = body;

        const normalizedCouponCode =
            typeof coupon === "string" && coupon.trim()
                ? coupon.trim().toUpperCase()
                : null;

        const allowedPaymentMethods = [
            "SSLC",
            "STRIPE",
            "COD",
        ] as const;

        if (!allowedPaymentMethods.includes(paymentMethod)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid payment method",
                },
                { status: 400 }
            );
        }

        if (paymentMethod === "COD") {
            const user = await prisma.user.findUnique({
                where: {
                    id: session.user.id,
                },
                select: {
                    isBlocked: true,
                    isCODDisabled: true,
                },
            });

            if (!user || user.isBlocked) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Your account is not authorized to place this order.",
                    },
                    { status: 403 }
                );
            }

            if (user.isCODDisabled) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Cash on Delivery is not available for your account. Please choose another payment method.",
                    },
                    { status: 403 }
                );
            }
        }

        const allowedDeliveryOptions = [
            "Standard Drop",
            "Express Drop",
        ] as const;

        if (!allowedDeliveryOptions.includes(deliveryOption)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid delivery option",
                },
                { status: 400 }
            );
        }

        const cart = await prisma.cart.findUnique({
            where: {
                userId: session.user.id,
            },
            select: cartItemsSelect,
        });

        if (!cart || cart.cartItems.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Cart is empty",
                },
                { status: 400 }
            );
        }

        const cartItems = cart.cartItems;

        const {
            label,
            fullName,
            street,
            city,
            house,
            zipCode,
            phone,
        } = address;

        const {
            USD_finalTotal,
            subTotal,
            discount,
            shippingCost,
        } = await calculateOrder(
            cartItems,
            country.value,
            coupon,
            deliveryOption
        );

        // Generate a unique order code.
        let orderCode = generateCustomId("HYP-ORD");

        while (
            await prisma.order.findUnique({
                where: { orderCode },
            })
        ) {
            orderCode = generateCustomId("HYP-ORD");
        }

        // Convert USD to BDT for SSLCOMMERZ.
        const res = await axios.get(
            "https://open.er-api.com/v6/latest/USD"
        );

        const rates = res.data.rates;

        const finalTotal =
            paymentMethod === "SSLC"
                ? USD_finalTotal * rates.BDT
                : 0;

        if (saveAddress) {
            const addressCount = await prisma.address.count({
                where: {
                    userId: session.user.id,
                },
            });

            if (addressCount >= 10) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Address limit reached. You can save up to 10 addresses.",
                    },
                    { status: 400 }
                );
            }
        }

        const order = await prisma.$transaction(async (tx) => {

            for (const item of cartItems) {
                const reserved = await tx.productVariant.updateMany({
                    where: {
                        id: item.variantId,
                        stock: {
                            gte: item.quantity,
                        },
                    },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });

                if (reserved.count !== 1) {
                    throw new Error("OUT_OF_STOCK");
                }
            }

            // Reserve one coupon use atomically.
            // If the limit has been reached, throw so the entire transaction
            // rolls back, including the stock reservation.
            if (normalizedCouponCode) {
                const appliedCoupon = await tx.coupon.findUnique({
                    where: {
                        code: normalizedCouponCode,
                    },
                    select: {
                        limit: true,
                    },
                });

                if (!appliedCoupon) {
                    throw new CouponError("Invalid coupon code.");
                }

                const couponReservation = await tx.coupon.updateMany({
                    where: {
                        code: normalizedCouponCode,
                        ...(appliedCoupon.limit !== null && {
                            usedCount: {
                                lt: appliedCoupon.limit,
                            },
                        }),
                    },
                    data: {
                        usedCount: {
                            increment: 1,
                        },
                    },
                });

                if (couponReservation.count !== 1) {
                    throw new CouponError(
                        "This coupon has reached its usage limit."
                    );
                }
            }

            const createdOrder = await tx.order.create({
                data: {
                    userId: session.user.id,
                    status: "PENDING",
                    orderCode,

                    orderHistory: {
                        create: {
                            fullName,
                            street,
                            city,
                            house,
                            zipCode,
                            country: country.name,
                            phone,
                        },
                    },

                    orderItems: {
                        create: cartItems.map(
                            (item: CartItemWithProductType) => ({
                                variantId: item.variantId,
                                quantity: item.quantity,
                                priceAtPurchase:
                                    item.variant.product.price,
                            })
                        ),
                    },

                    payments: {
                        create: {
                            method: paymentMethod,
                            status: "PENDING",
                            paidAmountInBDT: finalTotal,
                            paidAmountInUSD: USD_finalTotal,
                            totalProductPriceInUSD: subTotal,
                            discount,
                            shippingCost,
                            country: country.name,
                            shippingMethod: deliveryOption,
                            couponCode: normalizedCouponCode,
                        },
                    },
                },

                include: {
                    orderItems: {
                        select: {
                            variantId: true,
                            quantity: true,
                        },
                    },
                    payments: {
                        select: {
                            status: true,
                            couponCode: true,
                        },
                    },
                },
            });

            if (saveAddress) {
                await tx.address.create({
                    data: {
                        userId: session.user.id,
                        label,
                        fullName,
                        street,
                        city,
                        house,
                        zipCode,
                        country: country.name,
                        phone,
                    },
                });
            }

            // IMPORTANT:
            // Do not change user.isNewUser here.
            // Online payment may still fail or be cancelled.
            // The update is handled by completePayment() instead.

            return createdOrder;
        });

        switch (paymentMethod) {
            case "SSLC": {
                const tran_id = order.orderCode;
                const orderId = order.id;

                const sslData = {
                    store_id: process.env.SSLC_STORE_ID,
                    store_passwd:
                        process.env.SSLC_STORE_PASSWORD,
                    total_amount: finalTotal,
                    currency: "BDT",
                    tran_id,
                    orderId,
                    success_url:
                        `${process.env.BASE_URL}/api/payment/success`,
                    fail_url:
                        `${process.env.BASE_URL}/api/payment/fail`,
                    cancel_url:
                        `${process.env.BASE_URL}/api/payment/cancel`,
                    product_name: "Order Payment",
                    product_category: "Ecommerce",
                    product_profile: "general",
                };

                const response = await axios.post(
                    "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
                    new URLSearchParams(sslData as any),
                    {
                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded",
                        },
                    }
                );

                const data = response.data;

                return NextResponse.json({
                    success: true,
                    paymentUrl: data.GatewayPageURL,
                });
            }

            case "STRIPE": {
                const paymentIntent =
                    await stripe.paymentIntents.create({
                        amount: Math.round(
                            USD_finalTotal * 100
                        ),
                        currency: "usd",
                        payment_method_types: ["card"],

                        metadata: {
                            orderId: order.id,
                            orderCode: order.orderCode,
                            userId: session.user.id,
                        },
                    });

                await prisma.payment.updateMany({
                    where: {
                        orderId: order.id,
                    },
                    data: {
                        paymentIntentId: paymentIntent.id,
                    },
                });

                return NextResponse.json({
                    success: true,
                    orderId: order.id,
                    clientSecret:
                        paymentIntent.client_secret,
                });
            }

            case "COD": {
                // COD order is accepted, although payment remains pending.
                await completePayment(
                    order,
                    undefined,
                    "COD"
                );

                break;
            }
        }

        return NextResponse.json({
            success: true,
            message: "Order created successfully",
            orderId: order.id,
        });
    }
    catch (error) {
        if (
            error instanceof Error &&
            (
                error.message === "OUT_OF_STOCK" ||
                error.message === "Insufficient stock"
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Sorry, this product just went out of stock. Please update your cart and try again.",
                },
                { status: 409 }
            );
        }

        if (error instanceof CouponError) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message,
                },
                { status: 400 }
            );
        }

        console.error("Error creating order:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to create order",
            },
            { status: 500 }
        );
    }
}
