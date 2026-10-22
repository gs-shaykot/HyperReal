
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
    dispatchShipment,
    ensureShipmentForOrder,
    markShipmentPacked,
    rotateParcelToken,
    startPacking,
    TrackingError,
    verifyShipmentItem,
} from "@/lib/service/trackingService";
import { OrderStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

async function getAdmin() {
    const session = await getServerSession(authOptions);

    if (
        !session?.user?.id ||
        session.user.role !== "ADMIN"
    ) {
        return null;
    }

    return session.user;
}

function handleError(error: unknown) {
    if (error instanceof TrackingError) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: error.statusCode },
        );
    }

    console.error("Fulfillment API error:", error);

    return NextResponse.json(
        { success: false, message: "Fulfillment request failed." },
        { status: 500 },
    );
}

export async function GET() {
    try {
        if (!(await getAdmin())) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 },
            );
        }

        const orders = await prisma.order.findMany({
            where: {
                status: {
                    in: [
                        OrderStatus.PROCESSING,
                        OrderStatus.SHIPPED,
                        OrderStatus.DELIVERED,
                    ],
                },
                payments: {
                    some: {
                        OR: [
                            { method: "COD" },
                            { status: "SUCCESS" },
                        ],
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                orderCode: true,
                status: true,
                createdAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                orderHistory: true,
                orderItems: {
                    select: {
                        id: true,
                        quantity: true,
                        priceAtPurchase: true,
                        variant: {
                            select: {
                                size: true,
                                color: true,
                                product: {
                                    select: { id: true, name: true },
                                },
                            },
                        },
                    },
                },
                payments: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: {
                        method: true,
                        status: true,
                        paidAmountInUSD: true,
                        totalProductPriceInUSD: true,
                        shippingCost: true,
                    },
                },
                shipment: {
                    include: {
                        itemChecks: true,
                        assignedCourier: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                            },
                        },
                        events: {
                            orderBy: { createdAt: "desc" },
                        },
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            data: orders,
        });
    } catch (error) {
        return handleError(error);
    }
}

export async function POST(req: Request) {
    try {
        const admin = await getAdmin();

        if (!admin) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 },
            );
        }

        const body: unknown = await req.json();

        if (
            typeof body !== "object" ||
            body === null ||
            !("action" in body) ||
            typeof body.action !== "string"
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid request body." },
                { status: 400 },
            );
        }

        const data = body as {
            action: string;
            orderId?: string;
            shipmentId?: string;
            orderItemId?: string;
        };


        if (data.action === "CREATE_SHIPMENT") {
            if (!data.orderId?.trim()) {
                return NextResponse.json(
                    { success: false, message: "Order ID is required." },
                    { status: 400 },
                );
            }

            const shipment = await ensureShipmentForOrder(data.orderId);
 
            const current = await prisma.shipment.findUnique({
                where: { id: shipment.id },
                select: { parcelTokenHash: true },
            });

            if (current && !current.parcelTokenHash) {
                const tokenData = await rotateParcelToken(shipment.id);

                return NextResponse.json({
                    success: true,
                    message: "Shipment created and QR token generated.",
                    data: {
                        ...shipment,
                        trackingCode: tokenData.trackingCode,
                        parcelToken: tokenData.token,
                    },
                });
            }

            return NextResponse.json({
                success: true,
                message: "Shipment is ready.",
                data: shipment,
            });
        }


        if (!data.shipmentId?.trim()) {
            return NextResponse.json(
                { success: false, message: "Shipment ID is required." },
                { status: 400 },
            );
        }

        switch (data.action) {
            case "START_PACKING": {
                const shipment = await startPacking(
                    data.shipmentId,
                    admin.id,
                );

                return NextResponse.json({
                    success: true,
                    message: "Packing started.",
                    data: shipment,
                });
            }

            case "VERIFY_ITEM": {
                if (!data.orderItemId?.trim()) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: "Order item ID is required.",
                        },
                        { status: 400 },
                    );
                }

                const result = await verifyShipmentItem(
                    data.shipmentId,
                    data.orderItemId,
                    admin.id,
                );

                return NextResponse.json({
                    success: true,
                    message: result.alreadyVerified
                        ? "Item was already verified."
                        : "Item verified.",
                    data: result,
                });
            }

            case "MARK_PACKED": {
                const shipment = await markShipmentPacked(
                    data.shipmentId,
                    admin.id,
                );

                return NextResponse.json({
                    success: true,
                    message: "Parcel marked as packed.",
                    data: shipment,
                });
            }

            case "DISPATCH": {
                const shipment = await dispatchShipment(
                    data.shipmentId,
                    admin.id,
                );

                return NextResponse.json({
                    success: true,
                    message: "Parcel dispatched.",
                    data: shipment,
                });
            }

            default:
                return NextResponse.json(
                    { success: false, message: "Unknown action." },
                    { status: 400 },
                );
        }
    } catch (error) {
        return handleError(error);
    }
}
