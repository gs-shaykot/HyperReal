import prisma from "@/lib/prisma";
import { completePayment } from "@/lib/service/paymentService";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
    const signature = req.headers.get("stripe-signature");
    console.log("[Stripe Webhook] Received webhook event");
    if (!signature) {
        console.error(
            "[Stripe Webhook] Missing stripe-signature header"
        );
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
        console.error("[Stripe Webhook] Error parsing webhook event:", err);
        return NextResponse.json({ success: false, message: "Error parsing webhook event" }, { status: 400 });
    }

    try {
        switch (event.type) {
            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.log(
                    `[Stripe Webhook] PaymentIntent succeeded: ${paymentIntent.id}`
                );

                const orderId = paymentIntent.metadata.orderId;
                if (!orderId) {
                    console.error("[Stripe Webhook] Missing orderId in paymentIntent metadata");
                    return NextResponse.json({ success: false, message: "Missing orderId in paymentIntent metadata" }, { status: 400 });
                }

                console.log("[Stripe Webhook] orderId:", orderId);

                const order = await prisma.order.findUnique({
                    where: {
                        id: orderId
                    },
                    select: {
                        id: true,
                        userId: true,

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
                            },
                        },
                    }
                });

                if (!order) {
                    console.error("[Stripe Webhook] Order not found:", orderId);

                    return new NextResponse("Order not found", { status: 404 });
                }
                console.log("[Stripe Webhook] Order found:", order);
                await completePayment(order, { paymentIntentId: paymentIntent.id });

                console.log(
                    "[Stripe Webhook] Payment completed:",
                    {
                        orderId,
                        paymentIntentId:
                            paymentIntent.id,
                    }
                );

                break;
            }
            default: {
                console.log(
                    "[Stripe Webhook] Ignoring event:",
                    event.type
                );
            }
        }
        return NextResponse.json({ received: true, });
    }
    catch (err) {
        console.error("[Stripe Webhook] Error handling webhook event:", err);
        return NextResponse.json({ success: false, message: "Error handling webhook event" }, { status: 500 });
    }
}
