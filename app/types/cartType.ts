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

export type CartItemWithProductType = CartItemType & {
    variant: {
        size: string;
        color: string;
        product: {
            name: string;
            price: number;
            isAvailable: boolean;
            category: {
                name: string;
            },
            productImages: {
                imageUrl: string;
                color: string;
            }[]
        }
    }
}