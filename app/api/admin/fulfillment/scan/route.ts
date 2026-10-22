
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hashParcelToken } from "@/lib/service/trackingService";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 },
            );
        }

        const body: unknown = await req.json();

        if (typeof body !== "object" || body === null) {
            return NextResponse.json(
                { success: false, message: "Invalid request body." },
                { status: 400 },
            );
        }

        const input = body as {
            token?: unknown;
            lookup?: unknown;
        };

        const token =
            typeof input.token === "string" ? input.token.trim() : "";

        const lookup =
            typeof input.lookup === "string" ? input.lookup.trim() : "";

        if (!token && !lookup) {
            return NextResponse.json(
                { success: false, message: "Scan a parcel QR or enter a tracking/order code." },
                { status: 400 },
            );
        }

        const shipment = await prisma.shipment.findFirst({
            where: token
                ? { parcelTokenHash: hashParcelToken(token) }
                : {
                    OR: [
                        { trackingCode: lookup },
                        { order: { orderCode: lookup } },
                    ],
                },
            select: {
                id: true,
                trackingCode: true,
                fulfillmentStatus: true,
                status: true,
                packedAt: true,
                dispatchedAt: true,
                deliveredAt: true,
                failureReason: true,
                order: {
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
                                phone: true,
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
                                            select: {
                                                id: true,
                                                name: true,
                                            },
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
                        trackingEvents: {
                            orderBy: { createdAt: "desc" },
                        },
                    },
                },
                itemChecks: true,
                assignedCourier: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        if (!shipment) {
            return NextResponse.json(
                {
                    success: false,
                    message: token
                        ? "Invalid or expired parcel QR token."
                        : "No matching parcel was found.",
                },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            message: "Parcel found.",
            data: shipment,
        });
    } catch (error) {
        console.error("Parcel scan error:", error);

        return NextResponse.json(
            { success: false, message: "Could not look up this parcel." },
            { status: 500 },
        );
    }
}
