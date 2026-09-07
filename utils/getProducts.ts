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

// Normalize user input so searches such as:
// "T-SHIRT", "t shirt", "T Shirt"
// are treated consistently.
const normalizeSearch = (value: string) => {
    return value
        .trim()
        .toLowerCase()
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ');
};

// Common search synonyms.
// These expand what the customer means without changing
// the actual product name.
const SEARCH_SYNONYMS: Record<string, string[]> = {
    't shirt': ['t shirt', 't-shirt', 'shirt', 'shirts', 'tee', 'tees'],
    shirt: ['shirt', 'shirts', 't shirt', 't-shirt', 'tee', 'tees'],
    shirts: ['shirt', 'shirts', 't shirt', 't-shirt', 'tee', 'tees'],
    tee: ['tee', 'tees', 'shirt', 'shirts', 't shirt', 't-shirt'],

    pant: ['pant', 'pants', 'trouser', 'trousers'],
    pants: ['pant', 'pants', 'trouser', 'trousers'],
    trouser: ['trouser', 'trousers', 'pant', 'pants'],
    trousers: ['trouser', 'trousers', 'pant', 'pants'],

    shoe: [
        'shoe',
        'shoes',
        'sneaker',
        'sneakers',
        'trainer',
        'trainers',
        'footwear',
    ],

    shoes: [
        'shoe',
        'shoes',
        'sneaker',
        'sneakers',
        'trainer',
        'trainers',
        'footwear',
    ],

    sneaker: [
        'shoe',
        'shoes',
        'sneaker',
        'sneakers',
        'trainer',
        'trainers',
        'footwear',
    ],

    sneakers: [
        'shoe',
        'shoes',
        'sneaker',
        'sneakers',
        'trainer',
        'trainers',
        'footwear',
    ],

    hoodie: ['hoodie', 'hoodies', 'sweatshirt'],

    jacket: ['jacket', 'jackets', 'outerwear'],

    coat: ['coat', 'coats', 'outerwear'],

    bag: ['bag', 'bags'],

    backpack: ['backpack', 'backpacks', 'bag', 'bags'],

    socks: ['sock', 'socks'],

    sock: ['sock', 'socks'],

    beanie: ['beanie', 'hat'],

    shorts: ['short', 'shorts'],

    short: ['short', 'shorts'],

    jogger: ['jogger', 'joggers', 'pant', 'pants'],

    joggers: ['jogger', 'joggers', 'pant', 'pants'],

    tech: ['tech', 'technology', 'tech gear'],

    technology: ['tech', 'technology', 'tech gear'],
};

const getSearchTerms = (search: string) => {
    const normalized = normalizeSearch(search);

    if (!normalized) {
        return [];
    }

    return Array.from(
        new Set([
            normalized,
            ...(SEARCH_SYNONYMS[normalized] ?? []),
        ])
    );
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

        const searchTerms = search
            ? getSearchTerms(search)
            : [];

        const where = {
            ...(searchTerms.length > 0
                ? {
                      OR: searchTerms.flatMap((term) => [
                          {
                              name: {
                                  contains: term,
                                  mode: 'insensitive' as const,
                              },
                          },
                          {
                              description: {
                                  contains: term,
                                  mode: 'insensitive' as const,
                              },
                          },
                          {
                              searchKeywords: {
                                  has: term,
                              },
                          },
                          {
                              category: {
                                  name: {
                                      contains: term,
                                      mode: 'insensitive' as const,
                                  },
                              },
                          },
                          {
                              category: {
                                  slug: {
                                      contains: term,
                                      mode: 'insensitive' as const,
                                  },
                              },
                          },
                      ]),
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

        return prisma.product.findMany({
            where,
            orderBy,
            include: {
                category: {
                    select: {
                        name: true,
                        slug: true,
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