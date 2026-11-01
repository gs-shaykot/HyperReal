import { randomBytes } from "node:crypto";
import {
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
    ReturnEventType,
    ReturnReason,
    ReturnStatus,
    Prisma,
} from "@prisma/client";
import prisma from "@/lib/prisma";

export const RETURN_WINDOW_DAYS = 7;

export class ReturnError extends Error {
    constructor(message: string, public readonly statusCode = 400) {
        super(message);
        this.name = "ReturnError";
    }
}

function makeReturnCode() {
    return `HYP-RET-${randomBytes(4).toString("hex").toUpperCase()}`;
}

const activeReturnStatuses: ReturnStatus[] = [
    ReturnStatus.REQUESTED,
    ReturnStatus.APPROVED,
    ReturnStatus.IN_TRANSIT,
    ReturnStatus.RECEIVED,
    ReturnStatus.INSPECTING,
    ReturnStatus.REFUND_APPROVED,
    ReturnStatus.REFUND_PROCESSING,
    ReturnStatus.REFUNDED,
];

export async function createReturnRequest(input: {
    userId: string;
    orderId: string;
    reason: ReturnReason;
    customerNote?: string;
    items: Array<{ orderItemId: string; quantity: number }>;
}) {
    if (!input.items.length || input.items.length > 30) {
        throw new ReturnError("Select between 1 and 30 order items.");
    }

    const normalized = new Map<string, number>();
    for (const item of input.items) {
        if (!item.orderItemId || !Number.isSafeInteger(item.quantity) || item.quantity < 1) {
            throw new ReturnError("Each return item needs a valid order item and quantity.");
        }
        normalized.set(item.orderItemId, (normalized.get(item.orderItemId) ?? 0) + item.quantity);
    }

    return prisma.$transaction(async (tx) => {
        const order = await tx.order.findFirst({
            where: { id: input.orderId, userId: input.userId },
            select: {
                id: true,
                orderCode: true,
                status: true,
                shipment: { select: { status: true, deliveredAt: true } },
                payments: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: { method: true, status: true },
                },
                orderItems: {
                    select: {
                        id: true,
                        quantity: true,
                        priceAtPurchase: true,
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
        });

        if (!order) throw new ReturnError("Order not found.", 404);
        if (order.status !== OrderStatus.DELIVERED || order.shipment?.status !== "DELIVERED" || !order.shipment.deliveredAt) {
            throw new ReturnError("Only confirmed delivered orders can be returned.", 409);
        }

        const deadline = new Date(order.shipment.deliveredAt.getTime() + RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000);
        if (Date.now() > deadline.getTime()) {
            throw new ReturnError("The 7-day return window has expired.", 409);
        }

        const payment = order.payments[0];
        if (!payment || payment.status !== PaymentStatus.SUCCESS) {
            throw new ReturnError("The order payment must be completed before requesting a return.", 409);
        }

        const orderItemsById = new Map(order.orderItems.map((item) => [item.id, item]));
        const requestedIds = [...normalized.keys()];
        const priorItems = await tx.returnItem.findMany({
            where: {
                orderItemId: { in: requestedIds },
                returnRequest: { status: { in: activeReturnStatuses } },
            },
            select: { orderItemId: true, requestedQuantity: true },
        });

        const alreadyRequested = new Map<string, number>();
        for (const item of priorItems) {
            alreadyRequested.set(item.orderItemId, (alreadyRequested.get(item.orderItemId) ?? 0) + item.requestedQuantity);
        }

        const createItems = [...normalized.entries()].map(([orderItemId, quantity]) => {
            const orderItem = orderItemsById.get(orderItemId);
            if (!orderItem) throw new ReturnError("One or more selected items do not belong to this order.");
            const remaining = orderItem.quantity - (alreadyRequested.get(orderItemId) ?? 0);
            if (quantity > remaining) {
                throw new ReturnError(`Return quantity exceeds the remaining eligible quantity for ${orderItem.variant.product.name}.`, 409);
            }
            return { orderItemId, requestedQuantity: quantity };
        });

        const returnRequest = await tx.returnRequest.create({
            data: {
                returnCode: makeReturnCode(),
                orderId: order.id,
                userId: input.userId,
                reason: input.reason,
                customerNote: input.customerNote?.trim().slice(0, 2000) || null,
                items: { create: createItems },
                events: {
                    create: {
                        type: ReturnEventType.REQUESTED,
                        title: "Return requested",
                        description: "Customer submitted a return request.",
                    },
                },
            },
            include: {
                items: {
                    include: {
                        orderItem: {
                            select: {
                                quantity: true,
                                priceAtPurchase: true,
                                variant: { select: { size: true, color: true, product: { select: { name: true } } } },
                            },
                        },
                    },
                },
                events: { orderBy: { createdAt: "asc" } },
            },
        });

        return { returnRequest, returnDeadline: deadline };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
