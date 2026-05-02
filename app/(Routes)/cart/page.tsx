import prisma from '@/lib/prisma';
import CartSections from './CartSections'
import React from 'react'

const Page = async () => {
    const coupons = await prisma.coupon.findMany();

    return (
        <div>
            <CartSections coupons={coupons} />
        </div>
    );
};

export default Page