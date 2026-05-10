import { CheckoutPage } from "@/app/(Routes)/checkout/CheckoutPage";

const page = async ({ searchParams, }: { searchParams: Promise<{ coupon?: string }>; }) => {
    const { coupon } = await searchParams;

    return <CheckoutPage couponCode={coupon || null} />;
};

export default page;