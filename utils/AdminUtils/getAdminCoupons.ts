
import prisma from "@/lib/prisma";

export async function getAdminCoupons() {
    const coupons = await prisma.coupon.findMany({
        orderBy: { expiryDate: "desc" },
    });

    const now = new Date();

    const active = coupons.filter((coupon) => //Save1000(NA)
        //                T || T = T &&
        (!coupon.expiryDate || coupon.expiryDate >= now) &&
        //                F || F = F &&
        (coupon.limit == null || coupon.usedCount < coupon.limit)
    );

    const expired = coupons.filter(
        (coupon) =>
            coupon.expiryDate !== null && coupon.expiryDate < now
    ).length;

    const totalUsed = coupons.reduce(
        (sum, coupon) => sum + coupon.usedCount,
        0
    );

    const percentageCoupons = coupons.filter(
        (coupon) => coupon.type.toLowerCase() === "percent"
    );

    const averageDiscount = percentageCoupons.length
        ? percentageCoupons.reduce((sum, coupon) => sum + coupon.value, 0) /
        percentageCoupons.length
        : 0;

    return {
        coupons,
        total: coupons.length,
        active,
        expired,
        totalUsed,
        averageDiscount,
    };
} 