import axios from "axios";

export const Postwishlist = async ({ productId }: { productId: string }) => { 
    if (!productId) {
        throw new Error('Product ID is required.');
    }
    const res = await axios.post('/api/user/wishlist', { productId }); 
    return res.data.data;
}

export const Getwishlist = async () => {
    const res = await axios.get('/api/user/wishlist'); 
    return res.data.data;
}