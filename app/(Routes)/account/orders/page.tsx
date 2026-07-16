import { AllOrder } from '@/app/(Routes)/account/orders/AllOrder';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import React from 'react';

const page = async () => {
    const session = await getServerSession(authOptions);
    const orders = await prisma.order.findMany({
        where: {
            userId: session?.user.id
        }
    });
    console.log("Orders:", orders);
    return (
        <section className='text-zinc-100'>
            <AllOrder />
        </section>
    );
};

export default page;
