import { HeatProductWrapper } from '@/app/components/(Home_Components)/Trending/HeatProductWrapper'
import prisma from '@/lib/prisma'


export const HeatProduct = async () => {

    const heatProduct = await prisma.product.findMany({
        orderBy: {
            totalSold: 'desc'
        },
        include: {
            productImages: true,
            category: {
                select: {
                    name: true,
                }
            }
        },
        take: 4
    })

    const newestProduct = heatProduct.reduce((latest, current) => {
        return new Date(current.createdAt) > new Date(latest.createdAt)
            ? current
            : latest
    })

    const productsWithTags = heatProduct.map((product, index) => {
        const tags: string[] = []

        if (index === 0) tags.push('Bestseller')
        if (product.id === newestProduct.id) tags.push('New')

        return { ...product, tags }
    })

    return (
        <div className=''>
            <HeatProductWrapper productsWithTags={productsWithTags} />
        </div>
    )
}