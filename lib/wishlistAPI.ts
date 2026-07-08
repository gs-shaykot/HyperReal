import axios from "axios";

export const wishlistApi = async ({ productId }: { productId: string }) => {
    if (!productId) {
        throw new Error('Product ID is required.');
    } 
}