import prisma from "@/lib/prisma";

const Orders_PER_PAGE = 10;

type GetAdminOrdersParams = {
    search?: string;
    status?: string;
    page?: number;
};

export async function getAdminOrders({
    search = "",
    status,
    page = 1,
}: GetAdminOrdersParams = {}) {
    const normalizedSearch = search.trim();
    const where = {
        ...(normalizedSearch ? {
            OR: [
                {
                    orderCode: {
                        contains: normalizedSearch,
                        mode: "insensitive" as const,
                    }
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
            ]
        } : {})
    };

    const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
    const skip = (safePage - 1) * Orders_PER_PAGE;

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            orderBy: {
                id: "asc",
            },
            skip,
            take: Orders_PER_PAGE,
            select: {
                id: true,
                orderCode: true,
                status: true,

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

            }
        }),

        prisma.order.count({
            where,
        }),
    ]);


    const totalPages = Math.max(1, Math.ceil(total / Orders_PER_PAGE));


    return {
        orders,
        total,
        page: safePage,
        totalPages,
        pageSize: Orders_PER_PAGE,
    };
}