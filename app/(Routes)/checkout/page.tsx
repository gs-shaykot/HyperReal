import { CheckoutPage } from "@/app/(Routes)/checkout/CheckoutPage";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

const page = async ({ searchParams, }: { searchParams: Promise<{ coupon?: string }>; }) => {
    const { coupon } = await searchParams;
    const session = await getServerSession(authOptions);

    const addressesCount = await prisma.address.count({
        where: {
            userId: session?.user.id
        }
    });

    return <CheckoutPage couponCode={coupon || null} addressesCount={addressesCount} />;
};

export default page;