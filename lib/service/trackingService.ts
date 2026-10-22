
import { createHash, randomBytes } from "node:crypto";
import {
    FulfillmentStatus,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
    ShipmentStatus,
    TrackingEventType,
    Prisma,
} from "@prisma/client";
import prisma from "@/lib/prisma";

type DbClient = Prisma.TransactionClient;

export class TrackingError extends Error {
    constructor(
        message: string,
        public statusCode = 400,
    ) {
        super(message);
        this.name = "TrackingError";
    }
}

const hashToken = (token: string) =>
    createHash("sha256").update(token).digest("hex");

export async function ensureShipmentForOrder(orderId: string) {
    return prisma.$transaction(async (tx) => {
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
                "Only confirmed orders can enter fulfillment.",
            );
        }

        const payment = order.payments[0];

        if (!payment) {
            throw new TrackingError("Payment record not found.");
        }

        const isEligible =
            payment.method === PaymentMethod.COD ||
            payment.status === PaymentStatus.SUCCESS;

        if (!isEligible) {
            throw new TrackingError(
                "Payment must be confirmed before fulfillment.",
            );
        }

        const existing = await tx.shipment.findUnique({
            where: { orderId },
            include: { itemChecks: true },
        });

        if (existing) return existing;

        return tx.shipment.create({
            data: {
                orderId,
                itemChecks: {
                    create: order.orderItems.map((item) => ({
                        orderItemId: item.id,
                    })),
                },
                events: {
                    create: {
                        orderId,
                        type: TrackingEventType.ORDER_CONFIRMED,
                        title: "Order confirmed for fulfillment",
                        description:
                            "The order is eligible for fulfillment.",
                    },
                },
            },
            include: { itemChecks: true },
        });
    });
}

async function addEvent(
    tx: DbClient,
    input: {
        orderId: string;
        shipmentId: string;
        actorId: string;
        type: TrackingEventType;
        title: string;
        description?: string;
        metadata?: Prisma.InputJsonValue;
    },
) {
    await tx.orderTrackingEvent.create({
        data: {
            ...input,
            metadata: input.metadata,
        },
    });
}

export async function startPacking(
    shipmentId: string,
    actorId: string,
) {
    return prisma.$transaction(async (tx) => {
        const shipment = await tx.shipment.findUnique({
            where: { id: shipmentId },
            include: { order: true },
        });

        if (!shipment) {
            throw new TrackingError("Shipment not found.", 404);
        }

        if (
            shipment.fulfillmentStatus !==
            FulfillmentStatus.READY_TO_PACK
        ) {
            throw new TrackingError(
                "This parcel is not ready to start packing.",
            );
        }

        const updated = await tx.shipment.updateMany({
            where: {
                id: shipmentId,
                fulfillmentStatus: FulfillmentStatus.READY_TO_PACK,
            },
            data: {
                fulfillmentStatus: FulfillmentStatus.PACKING,
            },
        });

        if (updated.count !== 1) {
            throw new TrackingError(
                "Shipment changed. Refresh and try again.",
                409,
            );
        }

        await addEvent(tx, {
            orderId: shipment.orderId,
            shipmentId,
            actorId,
            type: TrackingEventType.PACKING_STARTED,
            title: "Packing started",
            description: "The fulfillment team started preparing the parcel.",
        });

        return tx.shipment.findUniqueOrThrow({
            where: { id: shipmentId },
        });
    });
}

export async function verifyShipmentItem(
    shipmentId: string,
    orderItemId: string,
    actorId: string,
) {
    return prisma.$transaction(async (tx) => {
        const shipment = await tx.shipment.findUnique({
            where: { id: shipmentId },
            select: {
                id: true,
                orderId: true,
                fulfillmentStatus: true,
                itemChecks: {
                    where: { orderItemId },
                    select: { id: true, verified: true },
                },
            },
        });

        if (!shipment) {
            throw new TrackingError("Shipment not found.", 404);
        }

        if (
            shipment.fulfillmentStatus !== FulfillmentStatus.PACKING
        ) {
            throw new TrackingError(
                "Items can only be verified while packing.",
            );
        }

        const check = shipment.itemChecks[0];

        if (!check) {
            throw new TrackingError(
                "This item does not belong to the shipment.",
                404,
            );
        }

        if (check.verified) {
            return { success: true, alreadyVerified: true };
        }

        await tx.shipmentItemCheck.update({
            where: { id: check.id },
            data: {
                verified: true,
                verifiedAt: new Date(),
                verifiedBy: actorId,
            },
        });

        await addEvent(tx, {
            orderId: shipment.orderId,
            shipmentId,
            actorId,
            type: TrackingEventType.ITEM_VERIFIED,
            title: "Item verified",
            description: "An order item was checked during packing.",
            metadata: { orderItemId },
        });

        return { success: true, alreadyVerified: false };
    });
}

export async function markShipmentPacked(
    shipmentId: string,
    actorId: string,
) {
    return prisma.$transaction(async (tx) => {
        const shipment = await tx.shipment.findUnique({
            where: { id: shipmentId },
            include: {
                itemChecks: true,
            },
        });

        if (!shipment) {
            throw new TrackingError("Shipment not found.", 404);
        }

        if (
            shipment.fulfillmentStatus !== FulfillmentStatus.PACKING
        ) {
            throw new TrackingError(
                "Only a parcel being packed can be marked packed.",
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

        const updated = await tx.shipment.updateMany({
            where: {
                id: shipmentId,
                fulfillmentStatus: FulfillmentStatus.PACKING,
            },
            data: {
                fulfillmentStatus: FulfillmentStatus.PACKED,
                packedAt: new Date(),
            },
        });

        if (updated.count !== 1) {
            throw new TrackingError(
                "Shipment changed. Refresh and try again.",
                409,
            );
        }

        await addEvent(tx, {
            orderId: shipment.orderId,
            shipmentId,
            actorId,
            type: TrackingEventType.PACKED,
            title: "Items verified and packed",
            description: "All order items passed the packing checklist.",
        });

        return tx.shipment.findUniqueOrThrow({
            where: { id: shipmentId },
        });
    });
}

export async function dispatchShipment(
    shipmentId: string,
    actorId: string,
) {
    return prisma.$transaction(async (tx) => {
        const shipment = await tx.shipment.findUnique({
            where: { id: shipmentId },
            select: {
                id: true,
                orderId: true,
                fulfillmentStatus: true,
                status: true,
            },
        });

        if (!shipment) {
            throw new TrackingError("Shipment not found.", 404);
        }

        if (
            shipment.fulfillmentStatus !== FulfillmentStatus.PACKED ||
            shipment.status !== ShipmentStatus.PENDING
        ) {
            throw new TrackingError(
                "Only a packed parcel awaiting dispatch can be dispatched.",
            );
        }

        const updated = await tx.shipment.updateMany({
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

        if (updated.count !== 1) {
            throw new TrackingError(
                "Shipment changed. Refresh and try again.",
                409,
            );
        }

        await tx.order.updateMany({
            where: {
                id: shipment.orderId,
                status: OrderStatus.PROCESSING,
            },
            data: { status: OrderStatus.SHIPPED },
        });

        await addEvent(tx, {
            orderId: shipment.orderId,
            shipmentId,
            actorId,
            type: TrackingEventType.DISPATCHED,
            title: "Parcel dispatched",
            description: "The packed parcel has left fulfillment.",
        });

        return tx.shipment.findUniqueOrThrow({
            where: { id: shipmentId },
        });
    });
}

export async function rotateParcelToken(shipmentId: string) {
    const token = randomBytes(32).toString("base64url");

    const shipment = await prisma.shipment.update({
        where: { id: shipmentId },
        data: { parcelTokenHash: hashToken(token) },
        select: { id: true, trackingCode: true },
    });
 
    return { ...shipment, token };
}

export function hashParcelToken(token: string) {
    return hashToken(token);
}
