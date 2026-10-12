
import { couponType } from "@/app/types/couponType";

export const getCouponValidationError = (
    coupon: couponType,
    subtotal: number,
    isNewUser: boolean,
    now = new Date()
): string | null => {
    if (!Number.isFinite(subtotal) || subtotal < 0) {
        return "Invalid order subtotal.";
    }

    if (
        coupon.expiryDate &&
        new Date(coupon.expiryDate).getTime() <= now.getTime()
    ) {
        return "This coupon has expired.";
    }

    if (
        coupon.limit != null &&
        coupon.usedCount >= coupon.limit
    ) {
        return "This coupon has reached its usage limit.";
    }

    if (coupon.newUserOnly && !isNewUser) {
        return "This coupon is only available for new users.";
    }

    if (subtotal < coupon.minSpend) {
        return `Minimum purchase of $${coupon.minSpend} is required for this coupon.`;
    }

    if (
        !Number.isFinite(coupon.value) ||
        coupon.value <= 0 ||
        (coupon.type === "percent" && coupon.value > 100)
    ) {
        return "This coupon has an invalid discount configuration.";
    }

    if (
        coupon.maxDiscount != null &&
        (!Number.isFinite(coupon.maxDiscount) || coupon.maxDiscount <= 0)
    ) {
        return "This coupon has an invalid maximum discount.";
    }

    return null;
};

export const getDiscount = (
    coupon: couponType,
    subtotal: number,
    isNewUser = false
): number => {
    if (
        getCouponValidationError(coupon, subtotal, isNewUser) !== null
    ) {
        return 0;
    }

    let discount =
        coupon.type === "percent"
            ? subtotal * (coupon.value / 100)
            : coupon.value;

    if (coupon.maxDiscount != null) {
        discount = Math.min(discount, coupon.maxDiscount);
    }

    // A coupon must never discount more than the product subtotal.
    return Math.max(0, Math.min(discount, subtotal));
};

export const getBestCoupon = (
    coupons: couponType[],
    subtotal: number,
    isNewUser: boolean
) => {
    const validCoupons = coupons.filter(
        (coupon) =>
            getCouponValidationError(coupon, subtotal, isNewUser) === null
    );

    if (!validCoupons.length) return null;

    return validCoupons
        .map((coupon) => ({
            ...coupon,
            savings: getDiscount(coupon, subtotal, isNewUser),
        }))
        .sort((a, b) => b.savings - a.savings)[0];
};

export const getNextBestCoupon = (
    coupons: couponType[],
    subtotal: number,
    isNewUser: boolean
) => {
    const eligibleForFuture = coupons
        .filter(
            (coupon) =>
                coupon.minSpend > subtotal &&
                getCouponValidationError(
                    coupon,
                    coupon.minSpend,
                    isNewUser
                ) === null
        )
        .sort((a, b) => a.minSpend - b.minSpend)
        .slice(0, 2);

    if (!eligibleForFuture.length) return null;

    return {
        updatedCoupons: eligibleForFuture.map((coupon) => ({
            ...coupon,
            remaining: coupon.minSpend - subtotal,
        })),
    };
};
