import axios from "axios";


export type ProductMutationData = {
    id?: string;
    name: string;
    category: string;
    price: number;
    description: string;
    badge?: string;
    sizes: string[];
    stock?: number;
    stockBySize: Record<string, number>;
    imageUrl?: string;
};

export const addAdminProduct = async (product: ProductMutationData) => {
    const res = await axios.post("/api/admin/products", product);
    if (res.status !== 200) {
        throw new Error("Failed to add product");
    }

    return res.data.data;
}

export const updateAdminProduct = async (product: ProductMutationData) => {
    const { id: productId, ...productData } = product;
    if (!productId) {
        throw new Error("Product ID is required.");
    }

    const response = await axios.patch(`/api/admin/products/${productId}`, productData);

    if (response.status !== 200) {
        throw new Error("Failed to update product");
    }
    
    return response.data.data;
}