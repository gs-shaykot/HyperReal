import { ProductDetails } from '@/app/(Routes)/products/[id]/ProductDetails';
import prisma from '@/lib/prisma';
import React from 'react'

export const page = async ({ params }: any) => {
    const { id } = await params;
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            category: { select: { name: true, slug: true } },
            productImages: {
                select: { imageUrl: true, color: true    },
                orderBy: {id: 'desc'}
            },
            productVariants: {
                select: {
                    id: true,
                    size: true,
                    color: true,
                    stock: true,
                },
                orderBy: [
                    { color: 'desc' },
                    { size: 'asc' },
                ]
            },
        },
    });
    if (!product) return null;

    return <ProductDetails product={product} />
}

export default page;