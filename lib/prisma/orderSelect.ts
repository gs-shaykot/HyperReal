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
    payments: true
} satisfies Prisma.OrderSelect;