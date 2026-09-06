import prisma from '@/lib/prisma';
import { cache } from 'react';

type GetProductsParams = {
    search?: string;
    categoryId?: string | null;
    minPrice?: string;
    maxPrice?: string;
    inStockOnly?: boolean;
    sort?: string;
};

export const getProducts = cache(
    async ({
        search,
        categoryId,
        minPrice,
        maxPrice,
        inStockOnly,
        sort,
    }: GetProductsParams = {}) => {
 
        const where = {
            ...(search
                ? {
                      name: {
                          contains: search,
                          mode: 'insensitive' as const,
                      },
                  }
                : {}),

            ...(categoryId
                ? {
                      categoryId,
                  }
                : {}),

            ...(minPrice || maxPrice
                ? {
                      price: {
                          ...(minPrice
                              ? {
                                    gte: Number(minPrice),
                                }
                              : {}),

                          ...(maxPrice
                              ? {
                                    lte: Number(maxPrice),
                                }
                              : {}),
                      },
                  }
                : {}),

            ...(inStockOnly
                ? {
                      isAvailable: true,
                  }
                : {}),
        };

        // Determine sorting
        let orderBy;

        switch (sort) {
            case 'price-low':
                orderBy = {
                    price: 'asc' as const,
                };
                break;

            case 'price-high':
                orderBy = {
                    price: 'desc' as const,
                };
                break;

            case 'most-sold':
                orderBy = {
                    totalSold: 'desc' as const,
                };
                break;

            case 'most-liked':
                orderBy = {
                    totalLikes: 'desc' as const,
                };
                break;

            case 'newest':
            default:
                orderBy = {
                    createdAt: 'desc' as const,
                };
                break;
        }

        // Fetch products using all active filters
        return prisma.product.findMany({
            where, 
            orderBy, 
            include: {
                category: {
                    select: {
                        name: true,
                    },
                },

                productImages: {
                    select: {
                        imageUrl: true,
                    },
                },
            },
        });
    }
);