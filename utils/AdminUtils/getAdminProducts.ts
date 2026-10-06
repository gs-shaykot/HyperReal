import prisma from "@/lib/prisma";

const PRODUCTS_PER_PAGE = 10;

type GetAdminProductsParams = {
    search?: string;
    categoryId?: string;
    page?: number;
};

export async function getAdminProducts({
    search = "",
    categoryId,
    page = 1,
}: GetAdminProductsParams = {}) {
    const normalizedSearch = search.trim();

    const where = {
        ...(normalizedSearch
            ? {
                OR: [
                    {
                        name: {
                            contains: normalizedSearch,
                            mode: "insensitive" as const,
                        },
                    },
                    {
                        description: {
                            contains: normalizedSearch,
                            mode: "insensitive" as const,
                        },
                    },
                    {
                        searchKeywords: {
                            has: normalizedSearch.toLowerCase(),
                        },
                    },
                ],
            }
            : {}),

        ...(categoryId
            ? {
                categoryId,
            }
            : {}),
    };

    const safePage = Math.max(1, page);
    const skip = (safePage - 1) * PRODUCTS_PER_PAGE;

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: PRODUCTS_PER_PAGE,

            select: {
                id: true,
                name: true,
                price: true,
                description: true,
                isAvailable: true,
                totalSold: true,
                totalLikes: true,
                createdAt: true,

                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                productImages: {
                    select: {
                        imageUrl: true,
                        color: true,
                    },
                },
                productVariants: {
                    select: {
                        id: true,
                        size: true,
                        color: true,
                        stock: true,
                        hex: true,
                    },

                    orderBy: [
                        {
                            color: "asc",
                        },
                        {
                            size: "asc",
                        },
                    ],
                },
            },
        }),

        prisma.product.count({
            where,
        }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE));

    return {
        products,
        total,
        page: safePage,
        totalPages,
        pageSize: PRODUCTS_PER_PAGE,
    };
}