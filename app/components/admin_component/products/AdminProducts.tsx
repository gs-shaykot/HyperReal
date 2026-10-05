"use client";
import { AdminProduct } from "@/app/types/AdminProduct";
import { keepPreviousData, useQuery, } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ProductsToolbar } from "./ProductsToolbar";
import { ProductsTable } from "./ProductsTable";
import { ProductsPagination } from "./ProductsPagination";

type Category = {
    id: string;
    name: string;
};

type AdminProductsProps = {
    initialProducts: AdminProduct[];
    initialTotal: number;
    initialTotalPages: number;
    categories: Category[];
};

export const AdminProducts = ({
    initialProducts,
    initialTotal,
    initialTotalPages,
    categories,
}: AdminProductsProps) => {
    const [search, setSearch] =
        useState("");

    const [category, setCategory] =
        useState("");

    const [page, setPage] =
        useState(1);

    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleCategoryChange = (value: string) => {
        setCategory(value);
        setPage(1);
    };

    const { data, isFetching, } = useQuery({
        queryKey: [
            "admin-products",
            debouncedSearch,
            category,
            page,
        ],

        queryFn: async () => {
            const params = new URLSearchParams();

            if (debouncedSearch) {
                params.set(
                    "search",
                    debouncedSearch
                );
            }

            if (category) {
                params.set(
                    "category",
                    category
                );
            }

            params.set(
                "page",
                String(page)
            );

            const response =
                await fetch(`/api/admin/products?${params}`);

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch products"
                );
            }

            const result = await response.json();

            return result.data;
        },

        /*
         * First page already came from SSR.
         */
        initialData:
            page === 1 &&
                !debouncedSearch &&
                !category
                ? {
                    products:
                        initialProducts,
                    total:
                        initialTotal,
                    page: 1,
                    totalPages:
                        initialTotalPages,
                }
                : undefined,

        placeholderData: keepPreviousData,
    });

    const products = data?.products ?? initialProducts;

    const total = data?.total ?? initialTotal;

    const totalPages = data?.totalPages ?? initialTotalPages;

    return (
        <div className="min-h-screen bg-main light:bg-white">

            <ProductsToolbar
                searchProduct={search}
                category={category}
                categories={categories}
                onSearchChangeAction={setSearch}
                onCategoryChangeAction={handleCategoryChange}
            />

            <div className="relative">
                {isFetching && (
                    <div className="absolute right-0 top-2 z-20">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                            Updating...
                        </span>
                    </div>
                )}

                <ProductsTable
                    categories={categories}
                    products={products}
                />
            </div>

            <ProductsPagination
                page={page}
                totalPages={totalPages}
                onPageChangeAction={setPage}
            />
        </div>
    );
};