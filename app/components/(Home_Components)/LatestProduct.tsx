import { LatestProductCard } from '@/app/components/(Home_Components)/LatestProductCard';
import prisma from '@/lib/prisma';
import { useSelector } from 'react-redux';

export const LatestProduct = async () => {
    const latestProduct = await prisma.product.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            productImages: true,
            category: {
                select: {
                    name: true,
                    slug: true
                }
            }
        },
        take: 5
    });

    return (
        <div>
            <LatestProductCard products={latestProduct} />
        </div>
    )
}
