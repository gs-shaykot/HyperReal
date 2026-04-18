import { UserType } from "@/app/types/RegisterState";

export type CartType = {
    id: string;
    userId: string;
    user: UserType;
    cartItems: CartItemType[];
}

export type CartItemType = {
    id?: string
    cartId?: string;
    variantId: string;
    quantity: number;
}
