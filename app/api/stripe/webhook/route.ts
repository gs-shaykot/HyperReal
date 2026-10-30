import prisma from "@/lib/prisma";
import { completePayment, releaseOrderStock } from "@/lib/service/paymentService";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
    const signature = req.headers.get("stripe-signature"); 
    if (!signature) {
        return NextResponse.json({ success: false, message: "Missing Stripe signature" }, { status: 400 });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SK!
        );
    }
    catch (err) {
        return NextResponse.json({ success: false, message: "Error parsing webhook event" }, { status: 400 });
    }

    try {
        const alreadyProcessed = await prisma.stripeWebhookEvent.findUnique({
            where: { id: event.id },
            select: { id: true },
        });
        if (alreadyProcessed) {
            return NextResponse.json({ received: true, duplicate: true });
        }

        switch (event.type) {
            case "payment_intent.succeeded": {
                const eventPaymentIntent = event.data.object as Stripe.PaymentIntent;
                const paymentIntentWithCharge = await stripe.paymentIntents.retrieve(eventPaymentIntent.id, {
                    expand: ["latest_charge"]
                });
                const paymentIntent = paymentIntentWithCharge;
                const charge = paymentIntent.latest_charge as Stripe.Charge;

                if (
                    paymentIntent.status !== "succeeded" ||
                    paymentIntent.currency.toLowerCase() !== "usd" ||
                    paymentIntent.amount_received !== paymentIntent.amount
                ) {
                    return NextResponse.json(
                        { success: false, message: "Stripe payment is not a fully captured USD payment." },
                        { status: 400 }
                    );
                }
 

                const orderId = paymentIntent.metadata.orderId;
                if (!orderId) {
                    return NextResponse.json({ success: false, message: "Missing orderId in paymentIntent metadata" }, { status: 400 });
                }
 

                const order = await prisma.order.findUnique({
                    where: {
                        id: orderId
                    },
                    select: {
                        id: true,
                        userId: true,
                        orderCode: true,
                        status: true,

                        orderItems: {
                            select: {
                                quantity: true,
                                variantId: true,
                            },
                        },

                        payments: {
                            select: {
                                status: true,
                                couponCode: true,
                                method: true,
                                paymentIntentId: true,
                                paidAmountInUSD: true,
                            },
                        },
                    }
                });

                if (!order) {
                    return new NextResponse("Order not found", { status: 404 });
                }

                const savedPayment = order.payments[0];
                if (!savedPayment || savedPayment.method !== "STRIPE") {
                    return NextResponse.json(
                        { success: false, message: "Order does not have a Stripe payment." },
                        { status: 400 }
                    );
                }

                if (
                    (savedPayment.paymentIntentId !== null && savedPayment.paymentIntentId !== paymentIntent.id) ||
                    paymentIntent.metadata.orderCode !== order.orderCode ||
                    paymentIntent.metadata.userId !== order.userId ||
                    paymentIntent.amount_received !== Math.round(savedPayment.paidAmountInUSD * 100)
                ) {
                    return NextResponse.json(
                        { success: false, message: "Stripe payment does not match the saved order." },
                        { status: 400 }
                    );
                }

                if (savedPayment.status !== "SUCCESS") {
                    if (order.status !== "PENDING") {
                        return NextResponse.json(
                            { success: false, message: "Payment/order state conflict requires reconciliation." },
                            { status: 409 }
                        );
                    }
                    const completed = await completePayment(order, {
                        paymentIntentId: paymentIntent.id,
                        stripeChargeId: charge?.id,
                        cardBrand: charge?.payment_method_details?.card?.brand,
                        last4: charge?.payment_method_details?.card?.last4,
                        receiptUrl: charge?.receipt_url,
                    });

                    if (!completed) {
                        const latest = await prisma.order.findUnique({
                            where: { id: order.id },
                            select: {
                                status: true,
                                payments: { select: { status: true } },
                            },
                        });

                        if (!(latest?.status === "PROCESSING" && latest.payments[0]?.status === "SUCCESS")) {
                            return NextResponse.json(
                                { success: false, message: "Stripe captured payment but the order transition did not complete. Manual reconciliation is required." },
                                { status: 409 }
                            );
                        }
                    }
                }

                break;
            }
            case "payment_intent.canceled": {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                const orderId = paymentIntent.metadata.orderId;
                if (!orderId) {
                    return NextResponse.json(
                        { success: false, message: "Missing orderId in cancelled PaymentIntent metadata." },
                        { status: 400 }
                    );
                }

                const order = await prisma.order.findUnique({
                    where: { id: orderId },
                    select: {
                        id: true,
                        status: true,
                        payments: {
                            select: {
                                method: true,
                                status: true,
                                paymentIntentId: true,
                            },
                        },
                    },
                });

                if (!order) {
                    return new NextResponse("Order not found", { status: 404 });
                }

                const payment = order.payments[0];
                if (!payment || payment.method !== "STRIPE") {
                    return NextResponse.json(
                        { success: false, message: "Order does not have a Stripe payment." },
                        { status: 400 }
                    );
                }

                // If the intent could not be saved but the initialization
                // handler already confirmed cancellation and released the order,
                // acknowledge its webhook without trying to release twice.
                if (payment.paymentIntentId !== paymentIntent.id) {
                    if (order.status === "CANCELLED" && payment.status === "FAILED") {
                        break;
                    }
                    return NextResponse.json(
                        { success: false, message: "Cancelled PaymentIntent does not match the saved order payment." },
                        { status: 400 }
                    );
                }

                // Only a signed Stripe cancellation event can release this
                // reservation. Browser return URLs never call this path.
                if (order.status === "PENDING" && payment.status === "PENDING") {
                    await releaseOrderStock(order.id);
                } else if (payment.status !== "FAILED" && order.status !== "CANCELLED") {
                    return NextResponse.json(
                        { success: false, message: "Cancellation conflicts with current order/payment state." },
                        { status: 409 }
                    );
                }
                break;
            }
        }
        // Store ignored event types too, so Stripe retries do not repeatedly
        // execute non-actionable event handling.
        await prisma.stripeWebhookEvent.create({
            data: { id: event.id, type: event.type },
        }).catch(async (error: { code?: string }) => {
            if (error?.code !== "P2002") throw error;
        });
        return NextResponse.json({ received: true });
    }
    catch (err) {
        return NextResponse.json({ success: false, message: "Error handling webhook event" }, { status: 500 });
    }
}
