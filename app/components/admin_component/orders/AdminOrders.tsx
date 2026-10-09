import { OrderProduct } from '@/app/types/OrderProduct';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React, { useEffect, useState } from 'react'

type AdminOrdersProps = {
    initialOrders: OrderProduct[];
    initialTotal: number;
    initialTotalPages: number;
}

export const AdminOrders = ({ initialOrders, initialTotal, initialTotalPages }: AdminOrdersProps) => {

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleStatusChange = (value: string) => {
        setStatus(value);
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

            const res = await axios.get(`/api/admin/orders?${params}`);

            if (res.status !== 200) {
                throw new Error("Failed to fetch orders");
            }

            return res.data.data;
        },

        initialData: page === 1 && !debouncedSearch && !status ? {
            orders: initialOrders,
            total: initialTotal,
            page: 1,
            totalPages: initialTotalPages,
        } : undefined,

        placeholderData: keepPreviousData
    });

    const orders = data?.orders ?? initialOrders;
    const totalPages = data?.totalPages ?? initialTotalPages;

    return (
        <div className="min-h-screen bg-main light:bg-white">
            
        </div>
    )
}

