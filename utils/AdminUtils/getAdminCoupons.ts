
import prisma from "@/lib/prisma";

export async function getAdminCoupons() {
    const coupons = await prisma.coupon.findMany({
        orderBy: {
            expiryDate: "desc",
        },
    });

    const now = new Date();

    const activeCoupons = coupons.filter((coupon) => //Save1000
        //                T || T = T &&
        (!coupon.expiryDate || coupon.expiryDate >= now) &&
        //                F || T = T &&
        (coupon.limit === null || coupon.usedCount < coupon.limit)
    );

    const expiredCoupons = coupons.filter(
        (coupon) =>
            coupon.expiryDate !== null &&
            coupon.expiryDate < now
    );

    const totalUsed = coupons.reduce(
        (total, coupon) => total + coupon.usedCount,
        0
    );

    const averageDiscount =
        coupons.length > 0
            ? coupons.reduce(
                (total, coupon) => total + coupon.value,
                0
            ) / coupons.length
            : 0;

    return {
        coupons,
        total: coupons.length,
        active: activeCoupons.length,
        expired: expiredCoupons.length,
        totalUsed,
        averageDiscount,
    };
}
