
import { createHash } from "node:crypto";
import { CartItemWithProductType } from "@/app/types/cartType";
import { authOptions } from "@/lib/auth";
import { CouponError } from "@/lib/errors/CouponError";
import { generateCustomId } from "@/lib/order_helpers/generateCustomId";
import prisma from "@/lib/prisma";
import { cartItemsSelect } from "@/lib/prisma/cartItemsSelect";
import { calculateOrder } from "@/lib/service/orderService";
import { completePayment, releaseOrderStock } from "@/lib/service/paymentService";
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
        const checkoutKey = req.headers.get("Idempotency-Key");

        if (!checkoutKey || checkoutKey.length < 16 || checkoutKey.length > 128) {
            return NextResponse.json(
                { success: false, message: "A valid Idempotency-Key header is required." },
                { status: 400 }
            );
        }

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

        // Read the current cart before fingerprinting the attempt. The cart is
        // part of the checkout identity: changing a variant or quantity must
        // never silently reuse an order created for different items.
        const cart = await prisma.cart.findUnique({
            where: { userId: session.user.id },
            select: cartItemsSelect,
        });

        const cartFingerprint = (cart?.cartItems ?? [])
            .map((item) => ({
                variantId: item.variantId,
                quantity: item.quantity,
            }))
            .sort((a, b) => a.variantId.localeCompare(b.variantId));

        // Normalize address fields rather than serializing the whole object.
        // Saved-address objects may contain extra fields that are irrelevant
        // to shipping and can otherwise make equivalent checkouts hash differently.
        const addressFingerprint = {
            label: address?.label ?? "",
            fullName: address?.fullName ?? "",
            street: address?.street ?? "",
            city: address?.city ?? "",
            house: address?.house ?? "",
            zipCode: address?.zipCode ?? "",
            country: address?.country ?? country?.name ?? "",
            phone: address?.phone ?? "",
        };

        const checkoutFingerprint = createHash("sha256")
            .update(JSON.stringify({
                userId: session.user.id,
                cart: cartFingerprint,
                country: country?.value,
                coupon: normalizedCouponCode,
                paymentMethod,
                address: addressFingerprint,
                saveAddress: Boolean(saveAddress),
                deliveryOption,
            }))
            .digest("hex");

        const previousAttempt = await prisma.order.findUnique({
            where: { checkoutKey },
            select: {
                id: true,
                userId: true,
                orderCode: true,
                status: true,
                checkoutFingerprint: true,
                payments: {
                    select: {
                        method: true,
                        status: true,
                        paymentIntentId: true,
                        checkoutUrl: true,
                        sslSessionKey: true,
                        paidAmountInUSD: true,
                    },
                },
            },
        });

        if (previousAttempt) {
            const previousPayment = previousAttempt.payments[0];

            // A completed order is authoritative even though completePayment()
            // has already emptied the user's cart. Retrying the same request
            // must return the completed order, not fail its cart fingerprint.
            if (
                previousAttempt.userId === session.user.id &&
                previousAttempt.status === "PROCESSING" &&
                previousPayment?.status === "SUCCESS"
            ) {
                return NextResponse.json({
                    success: true,
                    orderId: previousAttempt.id,
                    alreadyCompleted: true,
                });
            }

            if (
                previousAttempt.userId !== session.user.id ||
                previousAttempt.checkoutFingerprint !== checkoutFingerprint
            ) {
                const previousAttemptReleased =
                    previousAttempt.status === "CANCELLED" &&
                    previousPayment?.status === "FAILED";

                return NextResponse.json(
                    {
                        success: false,
                        code: previousAttemptReleased
                            ? "CHECKOUT_ATTEMPT_RELEASED"
                            : "CHECKOUT_KEY_CONFLICT",
                        orderId: previousAttempt.id,
                        message: previousAttemptReleased
                            ? "The previous checkout attempt was cancelled and its reservation was released. A new checkout attempt can be started."
                            : "This checkout key belongs to a different checkout that may still have an active reservation or payment. Do not start another payment. Retry the original checkout or resolve the previous order first.",
                    },
                    { status: 409 }
                );
            }
            if (
                previousPayment?.method === "STRIPE" &&
                !previousPayment.paymentIntentId &&
                previousAttempt.status === "PENDING" &&
                previousPayment.status === "PENDING"
            ) {
                // Recover a Stripe create request whose response may have been
                // lost. Stripe's same idempotency key returns the original intent
                // instead of creating another one.
                const recoveredIntent = await stripe.paymentIntents.create({
                    amount: Math.round(previousPayment.paidAmountInUSD * 100),
                    currency: "usd",
                    payment_method_types: ["card"],
                    metadata: {
                        orderId: previousAttempt.id,
                        orderCode: previousAttempt.orderCode,
                        userId: session.user.id,
                    },
                }, {
                    idempotencyKey: `hyperreal-checkout-${checkoutKey}`,
                });

                if (recoveredIntent.status === "canceled") {
                    await releaseOrderStock(previousAttempt.id);
                    return NextResponse.json(
                        { success: false, message: "The previous payment attempt is no longer usable. Your reservation was released; start a new checkout attempt." },
                        { status: 409 }
                    );
                }

                if (recoveredIntent.status === "succeeded") {
                    return NextResponse.json(
                        { success: false, message: "Stripe reports a successful payment that is still being reconciled. Do not retry payment; refresh shortly or contact support." },
                        { status: 409 }
                    );
                }

                if (!recoveredIntent.client_secret) {
                    return NextResponse.json(
                        { success: false, message: "Payment attempt is still being reconciled. Retry shortly with the same attempt." },
                        { status: 409 }
                    );
                }

                const saved = await prisma.payment.updateMany({
                    where: { orderId: previousAttempt.id, status: "PENDING", paymentIntentId: null },
                    data: { paymentIntentId: recoveredIntent.id },
                });
                if (saved.count !== 1) {
                    return NextResponse.json(
                        { success: false, message: "Payment attempt is still being reconciled. Retry shortly with the same attempt." },
                        { status: 409 }
                    );
                }

                return NextResponse.json({
                    success: true,
                    orderId: previousAttempt.id,
                    clientSecret: recoveredIntent.client_secret,
                    reusedAttempt: true,
                });
            }

            if (previousPayment?.method === "STRIPE" && previousPayment.paymentIntentId) {
                const intent = await stripe.paymentIntents.retrieve(previousPayment.paymentIntentId);

                if (intent.status === "succeeded") {
                    if (previousPayment.status === "SUCCESS") {
                        return NextResponse.json({ success: true, orderId: previousAttempt.id, alreadyCompleted: true });
                    }
                    return NextResponse.json(
                        { success: false, message: "Payment was captured but order state needs reconciliation. Please contact support and do not retry payment." },
                        { status: 409 }
                    );
                }

                if (previousAttempt.status === "CANCELLED") {
                    if (["requires_payment_method", "requires_confirmation", "requires_action", "requires_capture"].includes(intent.status)) {
                        await stripe.paymentIntents.cancel(intent.id).catch((error) => {
                        });
                    }
                    return NextResponse.json(
                        { success: false, message: "The previous payment attempt is no longer usable. Start a new checkout attempt." },
                        { status: 409 }
                    );
                }

                if (intent.client_secret && intent.status !== "canceled") {
                    return NextResponse.json({
                        success: true,
                        orderId: previousAttempt.id,
                        clientSecret: intent.client_secret,
                        reusedAttempt: true,
                    });
                }
                return NextResponse.json(
                    { success: false, message: "The previous payment attempt is no longer usable. Start a new checkout attempt." },
                    { status: 409 }
                );
            }

            if (previousPayment?.method === "SSLC" && previousAttempt.status === "CANCELLED") {
                // A confirmed failed SSLCommerz attempt has already transitioned
                // the order/payment to CANCELLED/FAILED and released its stock.
                // Tell the client it is safe to rotate the checkout key so the
                // next submit creates a fresh order and a fresh gateway session.
                // Do not rotate for inconsistent states: they may still require
                // reconciliation and must not create another stock reservation.
                if (previousPayment.status === "FAILED") {
                    return NextResponse.json(
                        {
                            success: false,
                            code: "CHECKOUT_ATTEMPT_RELEASED",
                            orderId: previousAttempt.id,
                            message: "The previous SSLCommerz payment failed and its reservation was released. You can retry checkout.",
                        },
                        { status: 409 }
                    );
                }

                return NextResponse.json(
                    {
                        success: false,
                        code: "CHECKOUT_KEY_CONFLICT",
                        message: "The previous SSLCommerz attempt is cancelled but its payment state is not confirmed as failed. Do not retry payment yet; please refresh or contact support.",
                    },
                    { status: 409 }
                );
            }

            if (previousPayment?.method === "SSLC" && previousPayment.checkoutUrl) {
                return NextResponse.json({
                    success: true,
                    paymentUrl: previousPayment.checkoutUrl,
                    reusedAttempt: true,
                });
            }

            if (previousPayment?.method === "COD" && previousAttempt.status !== "CANCELLED") {
                return NextResponse.json({
                    success: true,
                    orderId: previousAttempt.id,
                    alreadyCompleted: true,
                });
            }

            return NextResponse.json(
                { success: false, message: "This checkout attempt is still being initialized. Retry shortly using the same attempt." },
                { status: 409 }
            );
        }

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
                    checkoutKey,
                    checkoutFingerprint,

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

                let sslInitializationResponseReceived = false;
                let sslGatewayUrl: string | null = null;
                try {
                    const response = await axios.post(
                        `${process.env.SSLCOMMERZ_API_BASE_URL || "https://sandbox.sslcommerz.com"}/gwprocess/v4/api.php`,
                        new URLSearchParams(sslData as any),
                        {
                            headers: {
                                "Content-Type":
                                    "application/x-www-form-urlencoded",
                            },
                        }
                    );

                    sslInitializationResponseReceived = true;
                    const data = response.data;

                    if (
                        typeof data.GatewayPageURL !== "string" ||
                        !data.GatewayPageURL
                    ) {
                        throw new Error("SSLCOMMERZ did not return a gateway URL.");
                    }
                    sslGatewayUrl = data.GatewayPageURL;
                    if (typeof data.sessionkey !== "string" || !data.sessionkey) {
                        throw new Error("SSLCOMMERZ did not return a session key for reconciliation.");
                    }

                    const savedCheckoutUrl = await prisma.payment.updateMany({
                        where: { orderId: order.id, status: "PENDING" },
                        data: {
                            checkoutUrl: data.GatewayPageURL,
                            sslSessionKey: data.sessionkey,
                        },
                    });
                    if (savedCheckoutUrl.count !== 1) {
                        throw new Error("Could not persist SSLCOMMERZ checkout URL.");
                    }

                    return NextResponse.json({
                        success: true,
                        paymentUrl: data.GatewayPageURL,
                    });

                } catch (error) {
                    // If the request timed out or the connection failed, the gateway
                    // may still have created a session. Do not release inventory on
                    // an ambiguous outcome; reconcile it with the gateway first.
                    const safeToRelease = sslInitializationResponseReceived && !sslGatewayUrl;
                    if (safeToRelease) {
                        await releaseOrderStock(order.id);
                    }

                    return NextResponse.json(
                        {
                            success: false,
                            message: safeToRelease
                                ? "Unable to initialize payment. Your reservation was released; please start a new attempt."
                                : "Payment initialization outcome is uncertain. Your reservation is being held while the gateway status is reconciled; do not start another payment yet.",
                        },
                        { status: 502 }
                    );
                }

            }

            case "STRIPE": {
                let paymentIntent: Awaited<ReturnType<typeof stripe.paymentIntents.create>> | null = null;
                try {
                    paymentIntent = await stripe.paymentIntents.create({
                        amount: Math.round(USD_finalTotal * 100),
                        currency: "usd",
                        payment_method_types: ["card"],
                        metadata: {
                            orderId: order.id,
                            orderCode: order.orderCode,
                            userId: session.user.id,
                        },
                    }, {
                        // A Stripe idempotency key belongs to one immutable order
                        // initialization, not the browser's reusable checkout key.
                        // This prevents a changed checkout payload from colliding
                        // with a prior Stripe request made with the same client key.
                        idempotencyKey: `hyperreal-order-${order.id}`,
                    });

                    if (!paymentIntent.client_secret) {
                        throw new Error("Stripe did not return a client secret.");
                    }

                    const saved = await prisma.payment.updateMany({
                        where: { orderId: order.id, status: "PENDING" },
                        data: { paymentIntentId: paymentIntent.id },
                    });

                    if (saved.count !== 1) {
                        throw new Error("Could not persist Stripe PaymentIntent.");
                    }

                    return NextResponse.json({
                        success: true,
                        orderId: order.id,
                        clientSecret: paymentIntent.client_secret,
                    });
                } catch (error) {
                    // If Stripe created an intent but the DB save failed, cancel it
                    // before releasing stock. If cancellation cannot be confirmed,
                    // retain the reservation for reconciliation rather than risking
                    // a captured payment with released inventory.
                    let safeToRelease = false;
                    if (paymentIntent?.status === "canceled") {
                        safeToRelease = true;
                    } else if (paymentIntent && paymentIntent.status !== "succeeded") {
                        try {
                            const cancelled = await stripe.paymentIntents.cancel(paymentIntent.id);
                            safeToRelease = cancelled.status === "canceled";
                        } catch (cancelError) {
                        }
                    }

                    if (safeToRelease) {
                        await releaseOrderStock(order.id);
                    }

                    return NextResponse.json(
                        {
                            success: false,
                            message: safeToRelease
                                ? "Unable to initialize payment. Your reservation was released; please start a new attempt."
                                : "Payment initialization is being reconciled. Do not start another payment yet; retry shortly or contact support.",
                        },
                        { status: 502 }
                    );
                }
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

        // A concurrent request using the same unique checkout key may have
        // won the insert. Do not create another order; ask the client to retry
        // with the same key so the saved attempt can be recovered.
        const checkoutKey = req.headers.get("Idempotency-Key");
        if (checkoutKey && (error as { code?: string })?.code === "P2002") {
            const existing = await prisma.order.findUnique({
                where: { checkoutKey },
                select: { id: true },
            });
            if (existing) {
                return NextResponse.json(
                    { success: false, message: "This checkout attempt is being initialized. Retry shortly with the same attempt.", orderId: existing.id },
                    { status: 409 }
                );
            }
        }

        console.error("[checkout:create-order] Unexpected failure", {
            checkoutKey: req.headers.get("Idempotency-Key"),
            errorName: error instanceof Error ? error.name : "UnknownError",
            errorMessage: error instanceof Error ? error.message : String(error),
            prismaCode: (error as { code?: string })?.code,
            stack: error instanceof Error ? error.stack : undefined,
        });

        return NextResponse.json(
            {
                success: false,
                code: "ORDER_CREATION_FAILED",
                message: "We couldn't create your order. Please retry. If this continues, contact support with the time of the attempt.",
            },
            { status: 500 }
        );
    }
}
