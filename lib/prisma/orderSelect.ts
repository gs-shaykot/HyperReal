import { Prisma } from "@prisma/client";

export const orderDetailsSelect = {
    id: true,
    userId: true,
    status: true,
    orderCode: true,
    createdAt: true,

    orderItems: {
        select: {
            id: true,
            variantId: true,
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
                            price: true,

                            category: {
                                select: {
                                    name: true,
                                }
                            },
                            productImages: true
                        }
                    },
                }

            }
        }
    },
    orderHistory: true,
    payments: true,
    shipment: {
        select: {
            id: true,
            trackingCode: true,
            shippingType: true,
            carrierName: true,
            carrierTrackingNumber: true,
            estimatedDeliveryAt: true,
            customsStatus: true,
            internationalNotes: true,
            fulfillmentStatus: true,
            status: true,
            dispatchedAt: true,
            deliveredAt: true,
            deliveryAttempts: true,
            failureReason: true,
            events: {
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    type: true,
                    title: true,
                    description: true,
                    location: true,
                    createdAt: true,
                },
            },
        },
    }
} satisfies Prisma.OrderSelect;