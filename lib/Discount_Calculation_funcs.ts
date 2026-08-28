import { couponType } from "@/app/types/couponType";

const isCouponUsable = (coupon: couponType, isNewUser: boolean) => {
    if (coupon.expiryDate && new Date(coupon.expiryDate) <= new Date()) return false;

    if (coupon.limit !== null && coupon.limit !== undefined && coupon.usedCount >= coupon.limit) return false;

    if (coupon.newUserOnly && !isNewUser) return false;

    return true;
};

const isCouponEligible = (coupon: couponType, subtotal: number, isNewUser: boolean) => {
    return isCouponUsable(coupon, isNewUser) && subtotal >= coupon.minSpend;
};

export const getDiscount = (coupon: couponType, subtotal: number, isNewUser = false) => {
    if (!isCouponEligible(coupon, subtotal, isNewUser)) return 0;

    let discount = 0;

    if (coupon.type === 'percent') {
        discount = subtotal * (coupon.value / 100);
    }
    else {
        discount = coupon.value;
    }

    if (coupon.maxDiscount !== null && coupon.maxDiscount !== undefined) {
        discount = Math.min(discount, coupon.maxDiscount);
    }
    return discount;
}

export const getBestCoupon = (coupons: couponType[], subtotal: number, isNewUser: boolean) => {

    const validCoupons = coupons.filter(coupon => isCouponEligible(coupon, subtotal, isNewUser));

    if (!validCoupons.length) return null;

    return validCoupons.map(coupon => ({
        ...coupon,
        savings: getDiscount(coupon, subtotal, isNewUser)
    })).sort((a, b) => b.savings - a.savings)[0];
}

export const getNextBestCoupon = (coupons: couponType[], subtotal: number, isNewUser: boolean) => {
    const currentLockedCoupon = coupons.filter((coupon) => {
        return isCouponUsable(coupon, isNewUser) && subtotal < coupon.minSpend;
    }).sort((a, b) => a.minSpend - b.minSpend)
        .slice(0, 2);

    if (!currentLockedCoupon.length) return null;

    const updatedCoupons = currentLockedCoupon.map(coupon => ({
        ...coupon,
        remaining: coupon.minSpend - subtotal
    }))

    return { updatedCoupons }

}