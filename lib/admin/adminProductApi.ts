import axios from "axios";

export type AdminProductInput = {
    id?: string;
    name: string;
    description: string;
    price: number;
    categoryId: string;
    category: {
        id: string;
        name: string;
    };
    sizes: string[];
    imageUrl: string;
};

export const addAdminProduct = async (product: AdminProductInput) => {
    const res = await axios.post("/api/admin/products", product);
    if (res.status !== 200) {
        throw new Error("Failed to add product");
    }

    return res.data.data;
}

export const updateAdminProduct = async (product: AdminProductInput) => {
    if (!product.id) {
        throw new Error("Product ID is required.");
    }

    const res = await axios.patch('/api/admin/products', product);

    if (res.status !== 200) {
        throw new Error("Failed to update product");
    }
    // returns object like: {success: true}, {status:200}}
    return res.data.data;
}