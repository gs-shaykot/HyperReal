
"use client";

import axios from "axios";
import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import type { OrderStatus } from "@prisma/client";
import type { OrderProduct } from "@/app/types/OrderProduct";
import toast from "react-hot-toast";

type OrdersData = {
    orders: OrderProduct[];
    total: number;
    page: number;
    totalPages: number;
    pageSize?: number;
};

async function updateOrderStatus({
    id,
    status,
}: {
    id: string;
    status: OrderStatus;
}) {
    try {
        const res = await axios.patch("/api/admin/orders", {
            id,
            status,
        });

        return res.data.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(
                error.response?.data?.message ??
                    "Failed to update order status"
            );
        }

        throw error;
    }
}

export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateOrderStatus,

        onMutate: async ({ id, status }) => {
            await queryClient.cancelQueries({
                queryKey: ["admin-orders"],
            });

            const previous = queryClient.getQueriesData<OrdersData>({
                queryKey: ["admin-orders"],
            });

            queryClient.setQueriesData<OrdersData>(
                { queryKey: ["admin-orders"] },
                (old) => {
                    if (!old) return old;

                    return {
                        ...old,
                        orders: old.orders.map((order) =>
                            order.id === id
                                ? { ...order, status }
                                : order
                        ),
                    };
                }
            );

            return { previous };
        },

        onError: (error, _variables, context) => {
            context?.previous.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
            });

            toast.error(error.message);
        },

        onSuccess: () => {
            toast.success("Order status updated");
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["admin-orders"],
            });
        },
    });
}
