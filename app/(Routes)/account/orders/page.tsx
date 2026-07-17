import { AllOrder } from '@/app/(Routes)/account/orders/AllOrder';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { orderDetailsSelect } from '@/lib/prisma/orderSelect'; 
import { getServerSession } from 'next-auth';

const page = async () => {
    const session = await getServerSession(authOptions);

    const orders = await prisma.order.findMany({
        where: {
            userId: session?.user.id
        },
        select: orderDetailsSelect
    });

    return (
        <section className='text-zinc-100'>
            <AllOrder orders={orders} />
        </section>
    );
};

export default page;
