import axios from "axios";

export async function validateCouponApi(code: string) {
    try {
        console.log("Validating coupon code:", code);
        const response = await axios.post("/api/coupons/validate", { code });
        return response.data;
    }
    catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to validate coupon");
    }
}