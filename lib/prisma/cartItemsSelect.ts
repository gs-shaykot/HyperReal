import { Prisma } from "@prisma/client";

export const cartItemsSelect = {
    cartItems: {
        select: {
            id: true,
            cartId: true,
            variantId: true,
            quantity: true,
            variant: {
                select: {
                    size: true,
                    color: true,
                    product: {
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            isAvailable: true,
                            category: {
                                select: {
                                    name: true
                                }
                            },
                            productImages: {
                                select: {
                                    imageUrl: true,
                                    color: true,
                                }
                            }
                        },

                    }
                }
            }
        }
    }
} satisfies Prisma.CartSelect