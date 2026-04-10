import { LatestProductCard } from '@/app/components/(Home_Components)/Latest/LatestProductCard';
import prisma from '@/lib/prisma';


export const LatestProduct = async () => {
    const latestProduct = await prisma.product.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            productImages: {
                select: {
                    imageUrl: true
                }
            },
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
