import axios from "axios";

export const Postwishlist = async ({ productId, variantId }: { productId: string; variantId: string }) => {
    const res = await axios.post('/api/account/wishlist', { productId, variantId });
    return res.data.data;
}

export const Getwishlist = async () => {
    const res = await axios.get('/api/account/wishlist');
    return res.data.data;
}

export const DeleteWishlist = async ({ productId }: { productId: string }) => {
    const res = await axios.delete('/api/account/wishlist', { data: { productId } });
    return res.data.data;
}

export const ClearWishlist = async () => {
    const res = await axios.delete("/api/account/wishlist", {
        data: {
            clearAll: true,
        },
    });

    return res.data;
};