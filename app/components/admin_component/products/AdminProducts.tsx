"use client";

import { AdminProduct } from "@/app/types/AdminProduct";
import {
    keepPreviousData, useQuery,
} from "@tanstack/react-query";
import { 
    useSearchParams,
} from "next/navigation";

import { ProductsToolbar } from "./ProductsToolbar";
import { ProductsTable } from "./ProductsTable";
import { ProductsPagination } from "./ProductsPagination";

type Category = {
    id: string;
    name: string;
};

type AdminProductsProps = {
    products: AdminProduct[];
    categories: Category[];
};

type ProductsResponse = {
    success: boolean;
    data: {
        products: AdminProduct[];
        total: number;
        page: number;
        totalPages: number;
        pageSize: number;
    };
};

export const AdminProducts = ({
    products: initialProducts,
    categories,
}: AdminProductsProps) => {
    const searchParams = useSearchParams();

    const search =
        searchParams.get("search") ?? "";

    const category =
        searchParams.get("category") ?? "";

    const page =
        Number(
            searchParams.get("page") ?? "1"
        );

    const queryString =
        new URLSearchParams({
            ...(search
                ? { search }
                : {}),
            ...(category
                ? { category }
                : {}),
            page: String(page),
        }).toString();

    const {
        data,
        isFetching,
    } = useQuery<ProductsResponse>({
        queryKey: [
            "admin-products",
            search,
            category,
            page,
        ],

        queryFn: async () => {
            const response = await fetch(
                `/api/admin/products?${queryString}`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch products"
                );
            }

            return response.json();
        },

        initialData:
            page === 1 &&
                !search &&
                !category
                ? {
                    success: true,
                    data: {
                        products:
                            initialProducts,
                        total:
                            initialProducts.length,
                        page: 1,
                        totalPages: Math.max(
                            1,
                            Math.ceil(
                                initialProducts.length /
                                10
                            )
                        ),
                        pageSize: 10,
                    },
                }
                : undefined,

        placeholderData:
            keepPreviousData,

        staleTime: 30_000,
    });

    const productData =
        data?.data ?? {
            products: initialProducts,
            total: initialProducts.length,
            page,
            totalPages: 1,
            pageSize: 10,
        };

    return (
        <div className="min-h-screen bg-main px-4 py-6 light:bg-white">
            <div className="w-full">
                <ProductsToolbar
                    categories={categories}
                />

                <div className="relative">
                    {isFetching && (
                        <div className="pointer-events-none absolute right-0 top-2 z-20">
                            <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                                Updating...
                            </span>
                        </div>
                    )}

                    <ProductsTable
                        products={
                            productData.products
                        }
                    />
                </div>

                <ProductsPagination
                    page={productData.page}
                    totalPages={
                        productData.totalPages
                    }
                />
            </div>
        </div>
    );
};