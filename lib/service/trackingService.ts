
import { createHash, randomBytes } from "node:crypto";

import {
    FulfillmentStatus,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
    Prisma,
    ShipmentStatus,
    TrackingEventType,
} from "@prisma/client";

import prisma from "@/lib/prisma";

type TransactionClient = Prisma.TransactionClient;

export class TrackingError extends Error {
    constructor(
        message: string,
        public readonly statusCode = 400,
    ) {
        super(message);
        this.name = "TrackingError";
    }
}

function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

function generateCode(prefix: "HYP-TRK" | "HYP-PRT"): string {
    const suffix = randomBytes(5).toString("hex").toUpperCase();
    return `${prefix}-${suffix}`;
}

async function createTrackingEvent(
    tx: TransactionClient,
    input: {
        orderId: string;
        shipmentId: string;
        actorId?: string;
        type: TrackingEventType;
        title: string;
        description?: string;
        metadata?: Prisma.InputJsonValue;
    },
): Promise<void> {
    await tx.orderTrackingEvent.create({
        data: {
            orderId: input.orderId,
            shipmentId: input.shipmentId,
            actorId: input.actorId,
            type: input.type,
            title: input.title,
            description: input.description,
            metadata: input.metadata,
        },
    });
}

async function getShipmentOrThrow(
    tx: TransactionClient,
    shipmentId: string,
) {
    const shipment = await tx.shipment.findUnique({
        where: { id: shipmentId },
        include: {
            order: {
                select: {
                    id: true,
                    orderCode: true,
                    status: true,
                },
            },
            itemChecks: true,
        },
    });

    if (!shipment) {
        throw new TrackingError("Shipment not found.", 404);
    }

    return shipment;
}

/**
 * Creates one shipment for an eligible order.
 * The unique orderId constraint remains the final concurrency guard.
 */
export async function ensureShipmentForOrder(orderId: string) {
    try {
        return await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                select: {
                    id: true,
                    orderCode: true,
                    status: true,
                    orderItems: {
                        select: { id: true },
                    },
                    payments: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                        select: {
                            method: true,
                            status: true,
                        },
                    },
                },
            });

            if (!order) {
                throw new TrackingError("Order not found.", 404);
            }

            if (order.status !== OrderStatus.PROCESSING) {
                throw new TrackingError(
                    "Only processing orders can enter fulfillment.",
                );
            }

            if (order.orderItems.length === 0) {
                throw new TrackingError(
                    "Cannot create a shipment for an order without items.",
                );
            }

            const payment = order.payments[0];

            if (!payment) {
                throw new TrackingError(
                    "A payment record is required before fulfillment.",
                );
            }

            const paymentEligible =
                payment.method === PaymentMethod.COD || payment.status === PaymentStatus.SUCCESS;

            if (!paymentEligible) {
                throw new TrackingError(
                    "Online payment must succeed before fulfillment.",
                );
            }

            const existing = await tx.shipment.findUnique({
                where: { orderId },
                include: { itemChecks: true },
            });

            if (existing) {
                return existing;
            }

            const shipment = await tx.shipment.create({
                data: {
                    orderId,
                    trackingCode: generateCode("HYP-TRK"),
                    itemChecks: {
                        create: order.orderItems.map((item) => ({
                            orderItemId: item.id,
                        })),
                    },
                },
                include: { itemChecks: true },
            });

            await createTrackingEvent(tx, {
                orderId,
                shipmentId: shipment.id,
                type: TrackingEventType.ORDER_CONFIRMED,
                title: "Order ready for fulfillment",
                description:
                    "The order passed payment eligibility checks and entered fulfillment.",
            });

            return shipment;
        });
    } catch (error) {
        // Concurrent requests may both try to create the unique order shipment.
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            const existing = await prisma.shipment.findUnique({
                where: { orderId },
                include: { itemChecks: true },
            });

            if (existing) {
                return existing;
            }
        }

        throw error;
    }
}

export async function startPacking(
    shipmentId: string,
    actorId: string,
) {
    return prisma.$transaction(async (tx) => {
        const shipment = await getShipmentOrThrow(tx, shipmentId);

        if (
            shipment.fulfillmentStatus !==
            FulfillmentStatus.READY_TO_PACK
        ) {
            throw new TrackingError(
                "This shipment is not ready to start packing.",
                409,
            );
        }

        const result = await tx.shipment.updateMany({
            where: {
                id: shipmentId,
                fulfillmentStatus: FulfillmentStatus.READY_TO_PACK,
            },
            data: {
                fulfillmentStatus: FulfillmentStatus.PACKING,
            },
        });

        if (result.count !== 1) {
            throw new TrackingError(
                "Shipment state changed. Refresh and try again.",
                409,
            );
        }

        await createTrackingEvent(tx, {
            orderId: shipment.orderId,
            shipmentId,
            actorId,
            type: TrackingEventType.PACKING_STARTED,
            title: "Packing started",
            description: "The fulfillment team started preparing the parcel.",
        });

        return tx.shipment.findUniqueOrThrow({
            where: { id: shipmentId },
            include: { itemChecks: true },
        });
    });
}

export async function verifyShipmentItem(
    shipmentId: string,
    orderItemId: string,
    actorId: string,
) {
    return prisma.$transaction(async (tx) => {
        const shipment = await getShipmentOrThrow(tx, shipmentId);

        if (
            shipment.fulfillmentStatus !== FulfillmentStatus.PACKING
        ) {
            throw new TrackingError(
                "Items can only be verified while packing.",
                409,
            );
        }
        console.log("Shipment: ", shipment);
        const itemCheck = shipment.itemChecks.find(
            (item) => item.orderItemId === orderItemId,
        );

        if (!itemCheck) {
            throw new TrackingError(
                "This item does not belong to the shipment.",
                404,
            );
        }

        if (itemCheck.verified) {
            return {
                alreadyVerified: true,
                itemCheck,
            };
        }

        // Check the real, current inventory for this exact order-item variant.
        // A quantity equal to available stock is valid; only stock < quantity fails.
        const orderItem = await tx.orderItem.findFirst({
            where: {
                id: orderItemId,
                orderId: shipment.orderId,
            },
            select: {
                id: true,
                quantity: true,
                variant: {
                    select: {
                        stock: true,
                        product: {
                            select: {
                                name: true,
                            },
                        },
                        size: true,
                        color: true,
                    },
                },
            },
        });

        if (!orderItem) {
            throw new TrackingError(
                "The order item could not be found for this shipment.",
                404,
            );
        }

        if (orderItem.variant.stock < orderItem.quantity) {
            throw new TrackingError(
                `Insufficient stock for ${orderItem.variant.product.name} (Size ${orderItem.variant.size}, ${orderItem.variant.color}). Required: ${orderItem.quantity}; available: ${orderItem.variant.stock}.`,
                409,
            );
        }

        const updated = await tx.shipmentItemCheck.updateMany({
            where: {
                id: itemCheck.id,
                verified: false,
            },
            data: {
                verified: true,
                verifiedAt: new Date(),
                verifiedBy: actorId,
            },
        });

        if (updated.count !== 1) {
            throw new TrackingError(
                "Item verification changed. Refresh and try again.",
                409,
            );
        }

        await createTrackingEvent(tx, {
            orderId: shipment.orderId,
            shipmentId,
            actorId,
            type: TrackingEventType.ITEM_VERIFIED,
            title: "Order item verified",
            description: "An item passed the fulfillment checklist.",
            metadata: { orderItemId },
        });

        return {
            alreadyVerified: false,
            itemCheck: await tx.shipmentItemCheck.findUniqueOrThrow({
                where: { id: itemCheck.id },
            }),
        };
    });
}

export async function markShipmentPacked(
    shipmentId: string,
    actorId: string,
) {
    return prisma.$transaction(async (tx) => {
        const shipment = await getShipmentOrThrow(tx, shipmentId);

        if (
            shipment.fulfillmentStatus !== FulfillmentStatus.PACKING
        ) {
            throw new TrackingError(
                "Only a shipment being packed can be marked packed.",
                409,
            );
        }

        if (
            shipment.itemChecks.length === 0 ||
            shipment.itemChecks.some((item) => !item.verified)
        ) {
            throw new TrackingError(
                "Verify every order item before completing packing.",
            );
        }

        const packedAt = new Date();

        const result = await tx.shipment.updateMany({
            where: {
                id: shipmentId,
                fulfillmentStatus: FulfillmentStatus.PACKING,
            },
            data: {
                fulfillmentStatus: FulfillmentStatus.PACKED,
                packedAt,
            },
        });

        if (result.count !== 1) {
            throw new TrackingError(
                "Shipment state changed. Refresh and try again.",
                409,
            );
        }

        await createTrackingEvent(tx, {
            orderId: shipment.orderId,
            shipmentId,
            actorId,
            type: TrackingEventType.PACKED,
            title: "Parcel packed",
            description: "All order items were verified and packed.",
        });

        return tx.shipment.findUniqueOrThrow({
            where: { id: shipmentId },
            include: { itemChecks: true },
        });
    });
}

export async function dispatchShipment(
    shipmentId: string,
    actorId: string,
) {
    return prisma.$transaction(async (tx) => {
        const shipment = await getShipmentOrThrow(tx, shipmentId);

        if (
            shipment.fulfillmentStatus !== FulfillmentStatus.PACKED ||
            shipment.status !== ShipmentStatus.PENDING
        ) {
            throw new TrackingError(
                "Only a packed parcel awaiting dispatch can be dispatched.",
                409,
            );
        }

        const result = await tx.shipment.updateMany({
            where: {
                id: shipmentId,
                fulfillmentStatus: FulfillmentStatus.PACKED,
                status: ShipmentStatus.PENDING,
            },
            data: {
                fulfillmentStatus: FulfillmentStatus.DISPATCHED,
                dispatchedAt: new Date(),
            },
        });

        if (result.count !== 1) {
            throw new TrackingError(
                "Shipment state changed. Refresh and try again.",
                409,
            );
        }

        const orderResult = await tx.order.updateMany({
            where: {
                id: shipment.orderId,
                status: OrderStatus.PROCESSING,
            },
            data: {
                status: OrderStatus.SHIPPED,
            },
        });

        if (orderResult.count !== 1) {
            throw new TrackingError(
                "The order is no longer eligible for dispatch.",
                409,
            );
        }

        await createTrackingEvent(tx, {
            orderId: shipment.orderId,
            shipmentId,
            actorId,
            type: TrackingEventType.DISPATCHED,
            title: "Parcel dispatched",
            description: "The packed parcel has left fulfillment.",
        });

        return tx.shipment.findUniqueOrThrow({
            where: { id: shipmentId },
            include: { itemChecks: true },
        });
    });
}

/**
 * Generates a new parcel token.
 * The raw token is returned only to the caller; only its hash is stored.
 */
export async function rotateParcelToken(shipmentId: string) {
    const token = generateCode("HYP-PRT");

    const shipment = await prisma.shipment.update({
        where: { id: shipmentId },
        data: {
            parcelTokenHash: hashToken(token),
        },
        select: {
            id: true,
            orderId: true,
            trackingCode: true,
        },
    });

    return {
        shipment,
        token,
    };
}

export function hashParcelToken(token: string): string {
    return hashToken(token);
}
