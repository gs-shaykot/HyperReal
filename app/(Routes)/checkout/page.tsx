import { CheckoutPage } from '@/app/(Routes)/checkout/CheckoutPage';
import React from 'react'

const page = ({ searchParams }: { searchParams: { coupon?: string } }) => {
    const couponCode = searchParams?.coupon || null;
    
    return <CheckoutPage couponCode={couponCode} />;
}

export default page