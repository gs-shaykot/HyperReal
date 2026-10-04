import prisma from "@/lib/prisma";

export async function getRecentOrders() {
    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            orderBy: {
                createdAt: "desc",
            },
            take: 6,

            select: {
                id: true,
                orderCode: true,
                status: true,
                createdAt: true,

                user: {
                    select: {
                        name: true,
                    },
                },

                payments: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1,

                    select: {
                        paidAmountInUSD: true,
                        status: true,
                    },
                },
            },
        }),

        prisma.order.count(),
    ]);

    return {
        orders: orders.map((order) => ({
            id: order.id,
            orderCode: order.orderCode,
            customerName: order.user.name,
            status: order.status,

            amount:
                order.payments[0]?.paidAmountInUSD ?? 0,

            createdAt: order.createdAt,
        })),

        total,
    };
}