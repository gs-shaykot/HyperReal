import prisma from '@/lib/prisma'
import { cache } from 'react'


export const getProducts = cache(async (categoryId?: string) => {
    
    if (categoryId) {
        return prisma.product.findMany({
            where: {
                categoryId
            },
            include: {
                category: {
                    select: {
                        name: true
                    }
                },
                productImages: true
            }
        })
    }

    return prisma.product.findMany({
        include: {
            category: {
                select: {
                    name: true
                }
            },
            productImages: {
                select: {
                    imageUrl: true
                }
            }
        }
    })
})