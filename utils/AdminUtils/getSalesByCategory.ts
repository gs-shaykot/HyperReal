import prisma from "@/lib/prisma";

export type SalesByCategory = {
    name: string;
    revenue: number;
    percentage: number;
};

export async function getSalesByCategory(): Promise<SalesByCategory[]> {
    const orders = await prisma.order.findMany({
        where: {
            payments: {
                some: {
                    status: "SUCCESS",
                },
            },
        },
        select: {
            orderItems: {
                select: {
                    quantity: true,
                    priceAtPurchase: true,
                    variant: {
                        select: {
                            product: {
                                select: {
                                    category: {
                                        select: {
                                            name: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    const categoryRevenue = new Map<string, number>();

    for (const order of orders) {
        for (const item of order.orderItems) {
            const categoryName =
                item.variant.product.category.name;

            const revenue =
                item.priceAtPurchase * item.quantity;

            categoryRevenue.set(
                categoryName,
                (categoryRevenue.get(categoryName) ?? 0) +
                    revenue
            );
        }
    }

    const totalRevenue = Array.from(
        categoryRevenue.values()
    ).reduce(
        (total, revenue) => total + revenue,
        0
    );

    if (totalRevenue === 0) {
        return [];
    }

    return Array.from(categoryRevenue.entries())
        .map(([name, revenue]) => ({
            name,
            revenue: Number(revenue.toFixed(2)),
            percentage: Number(
                ((revenue / totalRevenue) * 100).toFixed(1)
            ),
        }))
        .sort((a, b) => b.revenue - a.revenue);
}