import { createHash, timingSafeEqual } from "node:crypto";
import { OrderStatus, PaymentMethod, PaymentStatus, ShipmentStatus, TrackingEventType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function getCourierId() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.sessionRevoked) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            role: true,
            isBlocked: true,
            courierProfile: { select: { isActive: true } },
        },
    });

    if (
        !user ||
        user.isBlocked ||
        user.role !== "COURIER" ||
        !user.courierProfile?.isActive
    ) {
        return null;
    }

    return user.id;
}

export async function GET() {
    const courierId = await getCourierId();

    if (!courierId) {
        return NextResponse.json({ success: false, message: "Sign in to view your deliveries." }, { status: 401 });
    }

    try {
        const shipments = await prisma.shipment.findMany({
            where: { assignedCourierId: courierId },
            orderBy: [{ status: "asc" }, { dispatchedAt: "desc" }],
            select: {
                id: true,
                trackingCode: true,
                status: true,
                fulfillmentStatus: true,
                dispatchedAt: true,
                deliveredAt: true,
                codCollected: true,
                deliveryAttempts: true,
                failureReason: true,
                deliveryNote: true,
                order: {
                    select: {
                        id: true,
                        orderCode: true,
                        orderHistory: {
                            select: {
                                fullName: true,
                                street: true,
                                city: true,
                                house: true,
                                zipCode: true,
                                country: true,
                                phone: true,
                            },
                        },
                        payments: {
                            orderBy: { createdAt: "desc" },
                            take: 1,
                            select: { method: true, status: true, paidAmountInUSD: true, totalProductPriceInUSD: true, shippingCost: true },
                        },
                        orderItems: {
                            select: {
                                quantity: true,
                                variant: {
                                    select: {
                                        size: true,
                                        color: true,
                                        product: { select: { name: true } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json({ success: true, data: shipments });
    } catch (error) {
        console.error("Courier deliveries load failed:", error);
        return NextResponse.json({ success: false, message: "Could not load assigned deliveries." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const courierId = await getCourierId();

    if (!courierId) {
        return NextResponse.json({ success: false, message: "Sign in to update deliveries." }, { status: 401 });
    }

    let body: { shipmentId?: unknown; action?: unknown; note?: unknown; otp?: unknown };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ success: false, message: "Invalid request body." }, { status: 400 });
    }

    const shipmentId = typeof body.shipmentId === "string" ? body.shipmentId.trim() : "";
    const action = typeof body.action === "string" ? body.action : "";
    const note = typeof body.note === "string" ? body.note.trim() : "";
    const otp = typeof body.otp === "string" ? body.otp.trim() : "";

    if (!shipmentId || !["START_DELIVERY", "COLLECT_COD", "REQUEST_DELIVERY_OTP", "MARK_DELIVERED", "MARK_FAILED"].includes(action)) {
        return NextResponse.json({ success: false, message: "A valid shipment and action are required." }, { status: 400 });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const shipment = await tx.shipment.findFirst({
                where: { id: shipmentId, assignedCourierId: courierId },
                include: {
                    order: {
                        select: {
                            id: true,
                            orderCode: true,
                            status: true,
                            payments: {
                                orderBy: { createdAt: "desc" },
                                take: 1,
                                select: { id: true, method: true, status: true },
                            },
                        },
                    },
                },
            });

            if (!shipment) {
                return { error: "This delivery is not assigned to your account.", status: 404 as const };
            }

            const payment = shipment.order.payments[0];

            if (action === "START_DELIVERY") {
                if (shipment.fulfillmentStatus !== "DISPATCHED" || !["PENDING", "FAILED"].includes(shipment.status)) {
                    return { error: "Only dispatched parcels awaiting delivery can be started.", status: 409 as const };
                }

                const updated = await tx.shipment.updateMany({
                    where: { id: shipmentId, assignedCourierId: courierId, status: shipment.status, fulfillmentStatus: "DISPATCHED" },
                    data: { status: ShipmentStatus.OUT_FOR_DELIVERY, failureReason: null },
                });
                if (updated.count !== 1) return { error: "Delivery status changed. Refresh and try again.", status: 409 as const };

                await tx.orderTrackingEvent.create({
                    data: { orderId: shipment.orderId, shipmentId, actorId: courierId, type: TrackingEventType.OUT_FOR_DELIVERY, title: "Out for delivery", description: "The assigned courier started delivery." },
                });
            } else if (action === "COLLECT_COD") {
                if (shipment.status !== ShipmentStatus.OUT_FOR_DELIVERY || payment?.method !== PaymentMethod.COD) {
                    return { error: "COD can only be collected for an active cash-on-delivery shipment.", status: 409 as const };
                }
                if (!shipment.codCollected) {
                    await tx.shipment.update({
                        where: { id: shipmentId },
                        data: { codCollected: true, codCollectedAt: new Date() },
                    });
                    if (payment) {
                        await tx.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.SUCCESS } });
                    }
                    await tx.orderTrackingEvent.create({
                        data: { orderId: shipment.orderId, shipmentId, actorId: courierId, type: TrackingEventType.NOTE_ADDED, title: "Cash collected", description: "Courier confirmed cash-on-delivery payment collection." },
                    });
                }
            } else if (action === "REQUEST_DELIVERY_OTP") {
                return { error: "Use the secure delivery OTP endpoint to request a code.", status: 400 as const };
            } else if (action === "MARK_DELIVERED") {
                if (shipment.status !== ShipmentStatus.OUT_FOR_DELIVERY) {
                    return { error: "Start delivery before marking this parcel delivered.", status: 409 as const };
                }
                if (payment?.method === PaymentMethod.COD && !shipment.codCollected) {
                    return { error: "Collect the COD payment before confirming delivery.", status: 409 as const };
                }
                if (!/^[0-9]{6}$/.test(otp)) {
                    return { error: "Enter the 6-digit customer verification code before completing delivery.", status: 400 as const };
                }
                if (!shipment.otpHash || !shipment.otpExpiresAt || shipment.otpExpiresAt <= new Date()) {
                    return { error: "The delivery code is missing or expired. Request a new code from the customer.", status: 400 as const };
                }
                if (shipment.otpAttempts >= 5) {
                    return { error: "Too many incorrect codes. Request a new code to continue.", status: 429 as const };
                }
                const submittedHash = createHash("sha256").update(otp).digest("hex");
                const expectedHash = Buffer.from(shipment.otpHash, "hex");
                const actualHash = Buffer.from(submittedHash, "hex");
                if (expectedHash.length !== actualHash.length || !timingSafeEqual(expectedHash, actualHash)) {
                    await tx.shipment.updateMany({
                        where: { id: shipmentId, assignedCourierId: courierId, status: ShipmentStatus.OUT_FOR_DELIVERY },
                        data: { otpAttempts: { increment: 1 } },
                    });
                    return { error: shipment.otpAttempts + 1 >= 5 ? "Incorrect code. The attempt limit is reached; request a new code." : "Incorrect delivery code. Please check with the customer.", status: shipment.otpAttempts + 1 >= 5 ? 429 as const : 400 as const };
                }

                const now = new Date();
                const updated = await tx.shipment.updateMany({
                    where: { id: shipmentId, assignedCourierId: courierId, status: ShipmentStatus.OUT_FOR_DELIVERY },
                    data: { status: ShipmentStatus.DELIVERED, deliveredAt: now, deliveryNote: note || null, failureReason: null, otpHash: null, otpExpiresAt: null, otpAttempts: 0 },
                });
                if (updated.count !== 1) return { error: "Delivery status changed. Refresh and try again.", status: 409 as const };

                await tx.order.update({ where: { id: shipment.orderId }, data: { status: OrderStatus.DELIVERED } });
                await tx.orderTrackingEvent.create({
                    data: { orderId: shipment.orderId, shipmentId, actorId: courierId, type: TrackingEventType.DELIVERED, title: "Delivered successfully", description: note || "Delivery confirmed using the customer verification code.", metadata: { verification: "EMAIL_OTP" } },
                });
            } else if (action === "MARK_FAILED") {
                if (shipment.status !== ShipmentStatus.OUT_FOR_DELIVERY) {
                    return { error: "Only an active delivery can be marked as failed.", status: 409 as const };
                }
                if (!note) return { error: "Add a short reason for the failed delivery.", status: 400 as const };

                const updated = await tx.shipment.updateMany({
                    where: { id: shipmentId, assignedCourierId: courierId, status: ShipmentStatus.OUT_FOR_DELIVERY },
                    data: { status: ShipmentStatus.FAILED, failureReason: note, deliveryNote: note, deliveryAttempts: { increment: 1 } },
                });
                if (updated.count !== 1) return { error: "Delivery status changed. Refresh and try again.", status: 409 as const };

                await tx.orderTrackingEvent.create({
                    data: { orderId: shipment.orderId, shipmentId, actorId: courierId, type: TrackingEventType.DELIVERY_FAILED, title: "Delivery attempt failed", description: note },
                });
            }

            return { success: true };
        });

        if ("error" in result) {
            return NextResponse.json({ success: false, message: result.error }, { status: result.status });
        }

        return NextResponse.json({ success: true, message: "Delivery updated." });
    } catch (error) {
        console.error("Courier delivery update failed:", error);
        return NextResponse.json({ success: false, message: "Could not update this delivery." }, { status: 500 });
    }
}
