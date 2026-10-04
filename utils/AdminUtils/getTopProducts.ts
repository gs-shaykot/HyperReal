import prisma from "@/lib/prisma";

export async function getTopProducts() {
    const products = await prisma.product.findMany({
        orderBy: {
            totalSold: "desc",
        },

        take: 5,

        select: {
            id: true,
            name: true,
            totalSold: true,
        },
    });

    return products.map((product) => ({
        id: product.id,
        name: product.name,
        sales: product.totalSold,
    }));
}