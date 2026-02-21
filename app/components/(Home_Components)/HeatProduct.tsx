import { HeatProductCard } from '@/app/components/(Home_Components)/HeatProductCard'
import prisma from '@/lib/prisma'


export const HeatProduct = async () => {

    const heatProduct = await prisma.product.findMany({
        orderBy: {
            totalSold: 'desc'
        },
        include: {
            productImages: true
        },
        take: 4
    })

    // find most recent product
    const newestProduct = heatProduct.reduce((latest, current) => {
        return new Date(current.createdAt) > new Date(latest.createdAt)
            ? current
            : latest
    })

    // attach tags
    const productsWithTags = heatProduct.map((product, index) => {
        const tags: string[] = []

        if (index === 0) tags.push('Bestseller')
        if (product.id === newestProduct.id) tags.push('New')

        return { ...product, tags }
    })
    productsWithTags.map((product) => console.log('Product with tags: ', product))
    return (
        <div className="max-w-7xl mx-auto py-10">
            <h2 className='text-4xl italic font-bold'>TRENDING<span className='text-second'> HEAT</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                {
                    productsWithTags.map((product) => (
                        // CARDS
                        <HeatProductCard product={product} key={product.id} />
                    ))
                }
            </div>
        </div>
    )
}