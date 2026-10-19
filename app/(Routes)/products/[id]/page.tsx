import { ProductDetails } from '@/app/(Routes)/products/[id]/ProductDetails';
import ReviewsSection from '@/app/(Routes)/products/[id]/ReviewsSection';
import prisma from '@/lib/prisma';

const page = async ({ params }: any) => {
    const { id } = await params;

    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            category: {
                select: {
                    name: true,
                    slug: true
                }
            },
            productImages: {
                select: {
                    imageUrl: true,
                    color: true
                },
                orderBy: {
                    id: 'desc'
                }
            },
            productVariants: {
                select: {
                    id: true,
                    size: true,
                    color: true,
                    hex: true,
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

    return (
        <>
            <ProductDetails product={product} />

            <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
                <ReviewsSection productId={product.id} />
            </div>
        </>
    );
}

export default page;