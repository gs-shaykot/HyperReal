import { CartItemType } from "@/app/types/cartType";
import axios from "axios";
import { NextResponse } from "next/server";

export const addToCartApi = async (data: CartItemType) => {

    try { 
        const res = await axios.post("/api/cart", data);

        if (!res.data.success) {
            throw new Error(res.data.message);
        }
        return res.data.data?.cartItems ?? [];
    }
    catch (error: unknown) {
        return NextResponse.json({ success: false, message: "Failed to add item to cart" }, { status: 500 });
        throw error;
    }
};

export const fetchCartApi = async () => {
    try {
        const res = await axios.get("/api/cart");

        if (!res.data.success) {
            throw new Error(res.data.message);
        }

        return res.data.data?.cartItems ?? [];
    }
    catch (error: unknown) {
        return [];
    }
}
