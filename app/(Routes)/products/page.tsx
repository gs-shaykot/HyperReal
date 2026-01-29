import { ProductLayout } from '@/app/(Routes)/products/ProductLayout';
import prisma from '@/lib/prisma'
import React from 'react'

export const page = async () => {
    const categories = await prisma.category.findMany(); 
    return (
        <div>
            <ProductLayout categories={categories} />
        </div>
    )
}

export default page