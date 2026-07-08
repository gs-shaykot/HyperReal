import axios from "axios";

export const Postwishlist = async ({ productId }: { productId: string }) => {
    console.log("Wishlist API is going to be called with productId: ", productId);
    if (!productId) {
        throw new Error('Product ID is required.');
    }
    const res = await axios.post('/api/user/wishlist', { productId });
    console.log("Wishlist API response: ", res.data.data);
    return res.data.data;
}

export const Getwishlist = async () => {
    const res = await axios.get('/api/user/wishlist');
    console.log("Wishlist fetched: ", res.data.data);
    return res.data.data;
}