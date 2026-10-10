
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
    keepPreviousData,
    useQuery,
} from "@tanstack/react-query";
import type { OrderProduct } from "@/app/types/OrderProduct";
import { OrdersToolbar } from "./OrdersToolbar";
import { OrdersTable } from "./OrdersTable";
import { OrdersPagination } from "./OrdersPagination";

type AdminOrdersProps = {
    initialOrders: OrderProduct[];
    initialTotal: number;
    initialTotalPages: number;
};

export const AdminOrders = ({
    initialOrders,
    initialTotal,
    initialTotalPages,
}: AdminOrdersProps) => {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setPage(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleStatusChange = (value: string) => {
        setStatus(value.toLowerCase() === "all" ? "" : value.toUpperCase());
        setPage(1);
    };

    const { data, isFetching } = useQuery({
        queryKey: [
            "admin-orders",
            debouncedSearch,
            status,
            page,
        ],

        queryFn: async () => {
            const params = new URLSearchParams();

            if (debouncedSearch) {
                params.set("search", debouncedSearch);
            }

            if (status) {
                params.set("status", status);
            }

            params.set("page", String(page));

            const res = await axios.get(
                `/api/admin/orders?${params.toString()}`
            );

            return res.data.data;
        },

        initialData:
            page === 1 && !debouncedSearch && !status
                ? {
                    orders: initialOrders,
                    total: initialTotal,
                    page: 1,
                    totalPages: initialTotalPages,
                }
                : undefined,

        placeholderData: keepPreviousData,
    });

    const orders = data?.orders ?? initialOrders;
    const total = data?.total ?? initialTotal;
    const totalPages = data?.totalPages ?? initialTotalPages;

    // Keep the displayed page valid if a filter reduces the page count.
    useEffect(() => {
        if (data && page > data.totalPages) {
            setPage(data.totalPages);
        }
    }, [data, page]);

    return (
        <div className="min-h-screen bg-main light:bg-white">
            <div className="mb-3 font-mono text-xs text-zinc-500">
                {total} {total === 1 ? "order" : "orders"}
            </div>

            <OrdersToolbar
                searchOrder={search}
                selectedStatus={status}
                onSearchChangeAction={setSearch}
                onStatusChangeAction={handleStatusChange}
            />

            <div className="relative">
                {isFetching && (
                    <div className="absolute right-0 top-2 z-20">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                            Updating...
                        </span>
                    </div>
                )}

                <OrdersTable orders={orders} />
            </div>

            <OrdersPagination
                page={page}
                totalPages={totalPages}
                onPageChangeAction={setPage}
            />
        </div>
    );
};
