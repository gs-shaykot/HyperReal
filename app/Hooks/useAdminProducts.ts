"use client"; 
import axios from "axios";
import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query"; 
import { AdminProduct } from "@/app/types/AdminProduct";
import toast from "react-hot-toast";

type ProductInput = {
    name: string;
    category: string;
    categoryName: string;
    price: number;
    description: string;
    sizes: string[];
    stockBySize: Record<string, number>;
    colors: {
        name: string;
        hex: string;
        imageUrl: string;
    }[];
};

// ==================================================
// API FUNCTIONS
// ==================================================

async function createProduct(data: ProductInput) {
    try {
        const res = await axios.post(
            "/api/admin/products",
            data
        );

        return res.data.data as AdminProduct;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(
                error.response?.data?.message ||
                    "Failed to create product"
            );
        }

        throw error;
    }
}

async function updateProduct(
    id: string,
    data: ProductInput
) {
    try {
        const res = await axios.patch(
            `/api/admin/products?id=${id}`,
            data
        );

        return res.data.data as AdminProduct;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(
                error.response?.data?.message ||
                    "Failed to update product"
            );
        }

        throw error;
    }
}

async function deleteProduct(id: string) {
    try {
        const res = await axios.delete(
            `/api/admin/products?id=${id}`
        );

        return res.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(
                error.response?.data?.message ||
                    "Failed to delete product"
            );
        }

        throw error;
    }
}

// ==================================================
// CREATE PRODUCT
// ==================================================

export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createProduct,

        onMutate: async (newProduct) => {
            // Stop any running products request
            await queryClient.cancelQueries({
                queryKey: ["admin-products"],
            });

            // Save all cached admin product queries
            const previous =
                queryClient.getQueriesData({
                    queryKey: ["admin-products"],
                });

            // Temporary product for UI
            const optimisticProduct: AdminProduct = {
                id: `temp-${Date.now()}`,

                name: newProduct.name,

                description:
                    newProduct.description,

                price: newProduct.price,

                isAvailable: true,

                totalSold: 0,

                totalLikes: 0,

                createdAt: new Date(),

                category: {
                    id: newProduct.category,
                    name: newProduct.categoryName,
                },

                productImages:
                    newProduct.colors.map(
                        (color) => ({
                            imageUrl:
                                color.imageUrl,
                            color: color.name,
                        })
                    ),

                productVariants:
                    newProduct.colors.flatMap(
                        (color) =>
                            newProduct.sizes.map(
                                (size) => ({
                                    id: `temp-${Date.now()}-${color.name}-${size}`,
                                    size,
                                    color: color.name,
                                    stock:
                                        newProduct
                                            .stockBySize[
                                            size
                                        ],
                                    hex: color.hex,
                                })
                            )
                    ),
            };

            // Update every cached admin-products query
            queryClient.setQueriesData(
                {
                    queryKey: ["admin-products"],
                },
                (old: any) => {
                    if (!old) return old;

                    return {
                        ...old,

                        products: [
                            optimisticProduct,
                            ...old.products,
                        ],

                        total: old.total + 1,
                    };
                }
            );

            return { previous };
        },

        onError: (error, _, context) => {
            // Restore all previous caches
            context?.previous?.forEach(
                ([queryKey, data]) => {
                    queryClient.setQueryData(
                        queryKey,
                        data
                    );
                }
            );

            toast.error(error.message);
        },

        onSuccess: () => {
            toast.success(
                "Product created successfully"
            );
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["admin-products"],
            });
        },
    });
}

// ==================================================
// UPDATE PRODUCT
// ==================================================

export function useUpdateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: ProductInput;
        }) => updateProduct(id, data),

        onMutate: async ({ id, data }) => {
            // Stop running products requests
            await queryClient.cancelQueries({
                queryKey: ["admin-products"],
            });

            // Save all cached queries
            const previous =
                queryClient.getQueriesData({
                    queryKey: ["admin-products"],
                });

            // Optimistically update every cache
            queryClient.setQueriesData(
                {
                    queryKey: ["admin-products"],
                },
                (old: any) => {
                    if (!old) return old;

                    return {
                        ...old,

                        products: old.products.map(
                            (
                                product: AdminProduct
                            ) => {
                                if (
                                    product.id !== id
                                ) {
                                    return product;
                                }

                                return {
                                    ...product,

                                    name: data.name,

                                    description:
                                        data.description,

                                    price: data.price,

                                    category: {
                                        id: data.category,
                                        name:
                                            data.categoryName,
                                    },

                                    productImages:
                                        data.colors.map(
                                            (color) => ({
                                                imageUrl:
                                                    color.imageUrl,
                                                color:
                                                    color.name,
                                            })
                                        ),

                                    productVariants:
                                        data.colors.flatMap(
                                            (color) =>
                                                data.sizes.map(
                                                    (
                                                        size
                                                    ) => ({
                                                        id:
                                                            product.productVariants.find(
                                                                (
                                                                    variant
                                                                ) =>
                                                                    variant.color ===
                                                                        color.name &&
                                                                    variant.size ===
                                                                        size
                                                            )?.id ??
                                                            `temp-${Date.now()}-${color.name}-${size}`,

                                                        size,

                                                        color:
                                                            color.name,

                                                        stock:
                                                            data
                                                                .stockBySize[
                                                                size
                                                                ],

                                                        hex:
                                                            color.hex,
                                                    })
                                                )
                                        ),
                                };
                            }
                        ),
                    };
                }
            );

            return { previous };
        },

        onError: (error, _, context) => {
            // Restore all previous caches
            context?.previous?.forEach(
                ([queryKey, data]) => {
                    queryClient.setQueryData(
                        queryKey,
                        data
                    );
                }
            );

            toast.error(error.message);
        },

        onSuccess: () => {
            toast.success(
                "Product updated successfully"
            );
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["admin-products"],
            });
        },
    });
}

// ==================================================
// DELETE PRODUCT
// ==================================================

export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteProduct,

        onMutate: async (id) => {
            // Stop running products requests
            await queryClient.cancelQueries({
                queryKey: ["admin-products"],
            });

            // Save all cached queries
            const previous =
                queryClient.getQueriesData({
                    queryKey: ["admin-products"],
                });

            // Remove product immediately
            queryClient.setQueriesData(
                {
                    queryKey: ["admin-products"],
                },
                (old: any) => {
                    if (!old) return old;

                    return {
                        ...old,

                        products:
                            old.products.filter(
                                (
                                    product: AdminProduct
                                ) =>
                                    product.id !== id
                            ),

                        total: Math.max(
                            0,
                            old.total - 1
                        ),
                    };
                }
            );

            return { previous };
        },

        onError: (error, _, context) => {
            // Restore all previous caches
            context?.previous?.forEach(
                ([queryKey, data]) => {
                    queryClient.setQueryData(
                        queryKey,
                        data
                    );
                }
            );

            toast.error(error.message);
        },

        onSuccess: () => {
            toast.success(
                "Product deleted successfully"
            );
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["admin-products"],
            });
        },
    });
}