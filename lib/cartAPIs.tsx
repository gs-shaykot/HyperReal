import { CartItemType } from "@/app/types/cartType";
import axios from "axios";

export const addToCartApi = async (data: CartItemType) => {
    console.log("Adding to cart:", data);

    try {
        const res = await axios.post("/api/cart", data);

        if (!res.data.success) {
            throw new Error(res.data.message);
        }

        console.log("Item added to cart:", res.data);
        return res.data.data?.cartItems ?? [];
    }
    catch (error: unknown) {
        console.error("Error adding item to cart:", error);
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
        console.error("Error fetching cart:", error);
        return [];
    }
}
