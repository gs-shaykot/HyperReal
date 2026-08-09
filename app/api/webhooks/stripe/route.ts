import { completePayment, markPaymentFailed } from "@/lib/service/paymentService";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const headersList = await headers();
        const signature = headersList.get("stripe-signature");

        const webhookSecret = process.env.STRIPE_WEBHOOK_SK || process.env.STRIPE_WEBHOOK_SECRET;

        if (!signature || !webhookSecret) {
            console.error("[Stripe Webhook Error] Missing signature or STRIPE_WEBHOOK_SK secret.");
            return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
        }

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            console.error(`[Stripe Webhook Signature Verification Failed]: ${err.message}`);
            return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
        }

        console.log(`[Stripe Webhook] Received Event: ${event.type}`);

        switch (event.type) {
            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                const orderId = paymentIntent.metadata?.orderId;

                let order;
                if (orderId) {
                    order = await prisma.order.findUnique({
                        where: { id: orderId },
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
                        },
                    });
                } else {
                    order = await prisma.order.findFirst({
                        where: {
                            payments: {
                                some: {
                                    paymentIntentId: paymentIntent.id,
                                },
                            },
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
                        },
                    });
                }

                if (order) {
                    let stripeChargeId: string | undefined;
                    let cardBrand: string | undefined;
                    let last4: string | undefined;
                    let receiptUrl: string | undefined;

                    if (paymentIntent.latest_charge) {
                        try {
                            const chargeId = typeof paymentIntent.latest_charge === 'string' 
                                ? paymentIntent.latest_charge 
                                : paymentIntent.latest_charge.id;
                            
                            const charge = await stripe.charges.retrieve(chargeId);
                            stripeChargeId = charge.id;
                            cardBrand = charge.payment_method_details?.card?.brand || undefined;
                            last4 = charge.payment_method_details?.card?.last4 || undefined;
                            receiptUrl = charge.receipt_url || undefined;
                        } catch (e) {
                            console.error("[Stripe Webhook] Error fetching charge details:", e);
                        }
                    }

                    await completePayment(order, {
                        paymentIntentId: paymentIntent.id,
                        stripeChargeId,
                        cardBrand,
                        last4,
                        receiptUrl,
                    });
                    console.log(`[Stripe Webhook] Order ${order.id} marked as SUCCESS.`);
                } else {
                    console.warn(`[Stripe Webhook] No order found for PaymentIntent: ${paymentIntent.id}`);
                }
                break;
            }

            case "payment_intent.payment_failed": {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                const orderId = paymentIntent.metadata?.orderId;
                if (orderId) {
                    await markPaymentFailed(orderId);
                    console.log(`[Stripe Webhook] Order ${orderId} marked as FAILED.`);
                }
                break;
            }

            default:
                console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error("[Stripe Webhook Exception]:", error);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
}
