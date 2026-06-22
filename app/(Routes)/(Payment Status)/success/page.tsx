
import { SuccessPage } from '@/app/(Routes)/(Payment Status)/success/SuccessPage';
import prisma from '@/lib/prisma';

const page = async ({ searchParams }: any) => {
    const { orderId } = await searchParams;

    const order = await prisma.order.findUnique({
        where: {
            id: orderId
        },
        select: {
            id: true,
            userId: true,
            status: true,
            totalAmount: true,
            orderCode: true,
            createdAt: true,
            address: true,
            discount: true,

            orderItems: {
                select: {
                    quantity: true,
                    priceAtPurchase: true,

                    variant: {
                        select: {
                            size: true,
                            color: true,

                            product: {
                                select: {
                                    name: true,
                                    price: true,

                                    category: {
                                        select: {
                                            name: true,
                                        }
                                    }
                                }
                            }
                        }

                    }
                }
            },

            payments: {
                select: {
                    orderId: true,
                    method: true,
                    status: true,
                    transactionId: true,
                    createdAt: true,
                    country: true,
                }
            }
        }
    });

    const user = await prisma.user.findUnique({
        where: {
            id: order?.userId
        }
    });
    console.log(order)
    return (
        <div>
            <SuccessPage order={order} user={user} />
        </div>
    )
}

export default page