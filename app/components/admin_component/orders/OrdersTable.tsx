
"use client";

import { Fragment, useState } from "react";
import { Eye, ChevronDown } from "lucide-react";
import type { OrderStatus } from "@prisma/client";
import type { OrderProduct } from "@/app/types/OrderProduct";
import { useUpdateOrderStatus } from "@/app/Hooks/useAdminOrders";

type Props = {
    orders: OrderProduct[];
};

const statuses: OrderStatus[] = [
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
];

function getOrderTotal(order: OrderProduct) {
    const payment = order.payments[0];

    if (!payment) {
        return order.orderItems.reduce(
            (total, item) =>
                total + item.priceAtPurchase * item.quantity,
            0
        );
    }

    return payment.paidAmountInUSD > 0
        ? payment.paidAmountInUSD
        : payment.totalProductPriceInUSD -
              payment.discount +
              payment.shippingCost;
}

function statusClass(status: OrderStatus) {
    switch (status) {
        case "PENDING":
            return "border-zinc-600 bg-zinc-800/40 text-zinc-300";
        case "PROCESSING":
            return "border-yellow-700/60 bg-yellow-500/10 text-yellow-400";
        case "SHIPPED":
            return "border-blue-700/60 bg-blue-500/10 text-blue-400";
        case "DELIVERED":
            return "border-lime-700/60 bg-lime-500/10 text-lime-400";
        case "CANCELLED":
            return "border-red-700/60 bg-red-500/10 text-red-400";
    }
}

export const OrdersTable = ({ orders }: Props) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const updateStatus = useUpdateOrderStatus();

    return (
        
        <div className="overflow-x-auto border border-zinc-800 light:border-zinc-200">
            <table className="w-full min-w-215 border-collapse">
                <thead>
                    <tr className="bg-white/2 light:bg-black/2">
                        {[
                            "Order ID",
                            "Customer",
                            "Items",
                            "Total",
                            "Date",
                            "Status",
                            "Actions",
                        ].map((heading) => (
                            <th
                                key={heading}
                                className={`px-3 py-4 text-left text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500 ${
                                    heading === "Actions" ? "text-right" : ""
                                }`}
                            >
                                {heading}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {orders.length > 0 ? (
                        orders.map((order) => {
                            const expanded = expandedId === order.id;
                            const itemCount = order.orderItems.reduce(
                                (sum, item) => sum + item.quantity,
                                0
                            );

                            return (
                                <Fragment key={order.id}>
                                    <tr
                                        key={order.id}
                                        className="border-t border-zinc-800 hover:bg-white/2.5 light:border-zinc-200"
                                    >
                                        <td className="px-3 py-4">
                                            <span className="font-mono text-[10px] font-bold text-white light:text-zinc-900">
                                                {order.orderCode}
                                            </span>
                                        </td>

                                        <td className="px-3 py-4">
                                            <p className="text-[11px] font-bold text-white light:text-zinc-900">
                                                {order.user.name}
                                            </p>
                                            <p className="mt-0.5 font-mono text-[9px] text-zinc-500">
                                                {order.user.email}
                                            </p>
                                        </td>

                                        <td className="px-3 py-4 font-mono text-[10px] text-zinc-400">
                                            {itemCount}{" "}
                                            {itemCount === 1 ? "item" : "items"}
                                        </td>

                                        <td className="px-3 py-4 font-mono text-[10px] font-bold text-white light:text-zinc-900">
                                            ${getOrderTotal(order).toFixed(2)}
                                        </td>

                                        <td className="whitespace-nowrap px-3 py-4 font-mono text-[10px] text-zinc-400">
                                            {new Date(order.createdAt).toLocaleDateString(
                                                "en-CA"
                                            )}
                                        </td>

                                        <td className="px-3 py-4">
                                            <span
                                                className={`inline-flex border px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${statusClass(order.status)}`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>

                                        <td className="px-3 py-4">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    type="button"
                                                    title="View order details"
                                                    aria-label={`View ${order.orderCode}`}
                                                    onClick={() =>
                                                        setExpandedId(
                                                            expanded ? null : order.id
                                                        )
                                                    }
                                                    className="text-zinc-500 hover:text-white light:hover:text-zinc-900"
                                                >
                                                    <Eye className="size-3.5" />
                                                </button>

                                                <div className="relative">
                                                    <select
                                                        aria-label={`Change status for ${order.orderCode}`}
                                                        value={order.status}
                                                        disabled={updateStatus.isPending}
                                                        onChange={(event) =>
                                                            updateStatus.mutate({
                                                                id: order.id,
                                                                status: event.target.value as OrderStatus,
                                                            })
                                                        }
                                                        className="max-w-29 appearance-none border border-zinc-800 bg-dark py-1 pl-2 pr-6 font-mono text-[9px] text-white outline-none focus:border-second disabled:opacity-50 light:border-zinc-300 light:bg-white light:text-zinc-900"
                                                    >
                                                        {statuses.map((status) => (
                                                            <option
                                                                key={status}
                                                                value={status}
                                                            >
                                                                {status}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>

                                    {expanded && (
                                        <tr
                                            key={`${order.id}-details`}
                                            className="border-t border-zinc-800 bg-white/2 light:border-zinc-200 light:bg-black/2"
                                        >
                                            <td
                                                colSpan={7}
                                                className="px-4 py-4"
                                            >
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div>
                                                        <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                                                            Order items
                                                        </p>

                                                        {order.orderItems.map((item) => (
                                                            <div
                                                                key={item.id}
                                                                className="mb-2 font-mono text-[10px] text-zinc-300 light:text-zinc-700"
                                                            >
                                                                {item.variant.product.name}
                                                                {" · "}
                                                                {item.variant.color}
                                                                {" / "}
                                                                {item.variant.size}
                                                                {" · Qty "}
                                                                {item.quantity}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div>
                                                        <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                                                            Shipping address
                                                        </p>

                                                        {order.orderHistory ? (
                                                            <div className="font-mono text-[10px] leading-5 text-zinc-400">
                                                                <p>{order.orderHistory.fullName}</p>
                                                                <p>
                                                                    {order.orderHistory.house},{" "}
                                                                    {order.orderHistory.street}
                                                                </p>
                                                                <p>
                                                                    {order.orderHistory.city},{" "}
                                                                    {order.orderHistory.zipCode}
                                                                </p>
                                                                <p>{order.orderHistory.country}</p>
                                                                <p>{order.orderHistory.phone}</p>
                                                            </div>
                                                        ) : (
                                                            <p className="text-[10px] text-zinc-500">
                                                                No shipping address available.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            );
                        })
                    ) : (
                        <tr>
                            <td
                                colSpan={7}
                                className="px-4 py-16 text-center font-mono text-xs text-zinc-500"
                            >
                                NO ORDERS FOUND
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
