
import prisma from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

const ORDERS_PER_PAGE = 10;

type GetAdminOrdersParams = {
    search?: string;
    status?: OrderStatus;
    page?: number;
};

export async function getAdminOrders({
    search = "",
    status,
    page = 1,
}: GetAdminOrdersParams = {}) {
    const normalizedSearch = search.trim();

    const where = {
        ...(normalizedSearch
            ? {
                OR: [
                    {
                        orderCode: {
                            contains: normalizedSearch,
                            mode: "insensitive" as const,
                        },
                    },
                    {
                        user: {
                            name: {
                                contains: normalizedSearch,
                                mode: "insensitive" as const,
                            },
                        },
                    },
                    {
                        user: {
                            email: {
                                contains: normalizedSearch,
                                mode: "insensitive" as const,
                            },
                        },
                    },
                ],
            }
            : {}),
        ...(status ? { status } : {}),
    };

    const safePage =
        Number.isFinite(page) && page > 0
            ? Math.floor(page)
            : 1;

    const skip = (safePage - 1) * ORDERS_PER_PAGE;

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: ORDERS_PER_PAGE,

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
                    select: {
                        id: true,
                        status: true,
                        paidAmountInUSD: true,
                        totalProductPriceInUSD: true,
                        discount: true,
                        shippingCost: true,
                        method: true,
                        country: true,
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                },

                orderHistory: {
                    select: {
                        fullName: true,
                        phone: true,
                        street: true,
                        city: true,
                        house: true,
                        zipCode: true,
                        country: true,
                    },
                },
            },
        }),

        prisma.order.count({ where }),
    ]);

    return {
        orders,
        total,
        page: safePage,
        totalPages: Math.max(
            1,
            Math.ceil(total / ORDERS_PER_PAGE)
        ),
        pageSize: ORDERS_PER_PAGE,
    };
}
