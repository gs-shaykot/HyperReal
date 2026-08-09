'use client'
import { CheckoutContent } from "@/app/(Routes)/checkout/CheckoutContent";
import StripeProvider from "@/app/providers/StripeProvider";

export const CheckoutPage = ({ couponCode, addressesCount }: { couponCode: string | null; addressesCount: number }) => {
    return (
        <StripeProvider>
            <CheckoutContent
                couponCode={couponCode}
                addressesCount={addressesCount}
            />
        </StripeProvider>
    )
}
