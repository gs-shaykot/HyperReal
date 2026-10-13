import { CouponForm } from "@/app/components/admin_component/coupons/AddCouponModal";
import { Coupon } from "@/app/components/admin_component/coupons/AdminCoupons";
import axios from "axios";

export const createCoupon = async (couponData: CouponForm): Promise<Coupon> => {
    try {
        const res = await axios.post("/api/admin/coupons", {
            ...couponData,
            code: couponData.code.trim().toUpperCase(),
            value: Number(couponData.value),
            minSpend: Number(couponData.minSpend),
            limit: couponData.limit === "" ? null : Number(couponData.limit),
            maxDiscount: couponData.type === "percent" && couponData.maxDiscount !== "" ? Number(couponData.maxDiscount) : null,
            expiryDate: couponData.expiryDate || null,
        });

        return res.data.data as Coupon
    }
    catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            throw new Error(
                error.response?.data?.message ?? "Could not create coupon."
            );
        }

        throw error;
    }
}
export async function deleteCoupon(id: string): Promise<void> {
    try {
        await axios.delete(`/api/admin/coupons?id=${encodeURIComponent(id)}`);
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            throw new Error(
                error.response?.data?.message ?? "Could not delete coupon."
            );
        }

        throw error;
    }
}