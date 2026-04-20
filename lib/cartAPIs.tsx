import { CartItemType } from "@/app/types/cartType";
import axios from "axios";
import { NextResponse } from "next/server";

export const addToCartApi = async (data: CartItemType) => {

    try {
        const res = await axios.post("/api/cart/cartItem", data);

        if (!res.data.success) {
            throw new Error(res.data.message);
        }
        return res.data.data?.cartItems ?? [];
    }
    catch (error: unknown) {
        throw error;
    }
};

export const fetchCartApi = async () => {
    try {
        const res = await axios.get("/api/cart/cartItem");

        return res.data?.data;
    }
    catch (error: unknown) {
        throw error;
    }
}

export const countCartItems = async () => {
    try {
        const res = await axios.get("/api/cart/cartCount");

        if (!res.data.success) {
            throw new Error(res.data.message);
        }

        return res.data.data?.count ?? 0;
    }
    catch (error: unknown) {
        throw error;
    }
}

export const deleteCartItemApi = async (itemId: string) => {
    try {
        const res = await axios.delete(`/api/cart/cartItem`, {
            data: { itemId }
        });

        if (!res.data.success) {
            throw new Error(res.data.message);
        }

        return res.data.data;
    }
    catch (error: unknown) {
        throw error;
    }
}