import { couponType } from "@/app/types/couponType";

export const getDiscount = (coupon: couponType, subtotal: number) => {
    if (subtotal < coupon.minSpend) return 0;

    let discount = 0;

    if (coupon.type === 'percent') {
        discount = subtotal * (coupon.value / 100);
    }
    else {
        discount = coupon.value;
    }

    if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
    }
    return discount;
}

export const getBestCoupon = (coupons: couponType[], subtotal: number, isNewUser: boolean) => {
    const validCoupons = coupons.filter(coupon => {
        if (coupon.newUserOnly && !isNewUser) return false;
        return subtotal >= coupon.minSpend;
    });

    if (!validCoupons.length) return null;

    return validCoupons.map(coupon => ({
        ...coupon,
        savings: getDiscount(coupon, subtotal)
    })).sort((a, b) => b.savings - a.savings)[0];
}

export const getNextBestCoupon = (coupons: couponType[], subtotal: number) => {
    const currentLockedCoupon = coupons.filter((coupon) => subtotal < coupon.minSpend).sort((a, b) => a.minSpend - b.minSpend);
    if (!currentLockedCoupon.length) return null;

    const nextBestCoupon = currentLockedCoupon[0];

    return {
        ...nextBestCoupon,
        remainingSpend: nextBestCoupon.minSpend - subtotal
    };
}