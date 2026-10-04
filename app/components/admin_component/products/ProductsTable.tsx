"use client";

import { AdminProduct } from "@/app/types/AdminProduct";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { ProductRow } from "./ProductRow";

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

type ProductsTableProps = {
    initialProducts: AdminProduct[];
};

export const ProductsTable = ({
    initialProducts,
}: ProductsTableProps) => {
    const searchParams = useSearchParams();

    const search =
        searchParams.get("search") ?? "";

    const category =
        searchParams.get("category") ?? "";

    const page =
        Number(searchParams.get("page") ?? "1");

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

    const { data, isFetching } =
        useQuery<ProductsResponse>({
            queryKey: [
                "admin-products",
                search,
                category,
                page,
            ],

            queryFn: async () => {
                const response =
                    await fetch(
                        `/api/admin/products?${queryString}`
                    );

                if (!response.ok) {
                    throw new Error(
                        "Failed to fetch products"
                    );
                }

                return response.json();
            },

            /*
             * Initial server-rendered products.
             */
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
                              totalPages: 1,
                              pageSize:
                                  initialProducts.length,
                          },
                      }
                    : undefined,

            staleTime: 30_000,
        });

    const products =
        data?.data.products ??
        initialProducts;

    return (
        <div className="relative mt-5 overflow-x-auto border border-zinc-800 light:border-zinc-200">
            {isFetching && (
                <div className="absolute right-3 top-3 z-10">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                        Updating...
                    </span>
                </div>
            )}

            <table className="w-full min-w-205 border-collapse">
                <thead>
                    <tr className="bg-white/2 light:bg-black/2">
                        <th className="px-3 py-3 text-left text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                            Product
                        </th>

                        <th className="px-3 py-3 text-left text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                            Category
                        </th>

                        <th className="px-3 py-3 text-left text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                            Price
                        </th>

                        <th className="px-3 py-3 text-left text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                            Badge
                        </th>

                        <th className="px-3 py-3 text-left text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                            Sizes
                        </th>

                        <th className="px-3 py-3 text-right text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {products.length > 0 ? (
                        products.map(
                            (product) => (
                                <ProductRow
                                    key={product.id}
                                    product={
                                        product
                                    }
                                />
                            )
                        )
                    ) : (
                        <tr>
                            <td
                                colSpan={6}
                                className="
                                    px-4
                                    py-16
                                    text-center
                                    font-mono
                                    text-xs
                                    text-zinc-500
                                "
                            >
                                NO PRODUCTS FOUND
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};