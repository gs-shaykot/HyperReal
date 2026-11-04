import { SuccessPage } from './SuccessPage';
import prisma from '@/lib/prisma';
import { orderDetailsSelect } from '@/lib/prisma/orderSelect';
import { notFound } from 'next/navigation';

type SuccessPageProps = {
    searchParams: Promise<{
        orderId?: string;
    }>;
};

const page = async ({ searchParams }: SuccessPageProps) => {
    const { orderId } = await searchParams;

    if (!orderId) {
        notFound();
    }

    const order = await prisma.order.findUnique({
        where: {
            id: orderId
        },
        select: orderDetailsSelect
    });

    if (!order) {
        notFound();
    }

    const user = await prisma.user.findUnique({
        where: {
            id: order?.userId
        },
        select: {
            id: true,
            name: true,
            email: true,
        },
    }); 

    return (
        <div>
            <SuccessPage order={order} user={user} />
        </div>
    )
}

export default page