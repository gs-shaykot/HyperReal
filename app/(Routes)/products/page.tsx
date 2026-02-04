import { ProductLayout } from '@/app/(Routes)/products/ProductLayout';
import prisma from '@/lib/prisma'
import React from 'react'

type SeachProps = {
    searchParams: {
        category?: string
    }
}

export const page = async ({ searchParams }: any) => {
    const { category } = await searchParams || null;
    const activeId = category ?? null;

    const categories = await prisma.category.findMany();
    let products = null;

    if (activeId) {
        products = await prisma.product.findMany({
            where: {
                categoryId: activeId ?? undefined
            }
        });
        console.log(products)
    }
    else {
        products = await prisma.product.findMany();
        console.log(products)
    }
    console.log(products);

    return (
        <div>
            <ProductLayout categories={categories} activeId={activeId} />
        </div>
    )
}

export default page