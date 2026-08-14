import { SuccessPage } from './SuccessPage';
import prisma from '@/lib/prisma';
import { orderDetailsSelect } from '@/lib/prisma/orderSelect';

const page = async ({ searchParams }: any) => {
    const { orderId } = await searchParams;

    const order = await prisma.order.findUnique({
        where: {
            id: orderId
        },
        select: orderDetailsSelect
    });

    const user = await prisma.user.findUnique({
        where: {
            id: order?.userId
        }
    }); 
    return (
        <div>
            <SuccessPage order={order} user={user} />
        </div>
    )
}

export default page