"use client";

import { Search, X } from "lucide-react";

type OrderFiltersProps = {
    search: string;
    onSearchChange: (value: string) => void;
    status: string;
    onStatusChange: (value: string) => void;
    payment: string;
    onPaymentChange: (value: string) => void;
    date: string;
    onDateChange: (value: string) => void;
    onClear: () => void;
};

const selectClass =
    "w-full border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-second light:bg-white light:text-zinc-900";

export function OrderFilters({
    search,
    onSearchChange,
    status,
    onStatusChange,
    payment,
    onPaymentChange,
    date,
    onDateChange,
    onClear,
}: OrderFiltersProps) {
    const hasFilters = Boolean(search || status !== "ALL" || payment !== "ALL" || date);

    return (
        <div className="mb-5 border border-zinc-800 p-3 light:border-zinc-200">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <label className="relative block">
                    <span className="sr-only">Search orders</span>
                    <Search
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                    />
                    <input
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Search order or product..."
                        className={`${selectClass} pl-9`}
                    />
                </label>

                <label>
                    <span className="sr-only">Order status</span>
                    <select value={status} onChange={(event) => onStatusChange(event.target.value)} className={selectClass}>
                        <option value="ALL">All order statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </label>

                <label>
                    <span className="sr-only">Payment status</span>
                    <select value={payment} onChange={(event) => onPaymentChange(event.target.value)} className={selectClass}>
                        <option value="ALL">All payment statuses</option>
                        <option value="SUCCESS">Paid</option>
                        <option value="PENDING">Payment pending</option>
                        <option value="FAILED">Payment failed</option>
                        <option value="COD">Cash on delivery</option>
                    </select>
                </label>

                <label>
                    <span className="sr-only">Order date</span>
                    <input
                        type="date"
                        value={date}
                        onChange={(event) => onDateChange(event.target.value)}
                        className={selectClass}
                    />
                </label>
            </div>

            {hasFilters && (
                <button
                    type="button"
                    onClick={onClear}
                    className="mt-3 inline-flex items-center gap-1 text-xs text-zinc-400 transition hover:text-second"
                >
                    <X size={14} />
                    Clear filters
                </button>
            )}
        </div>
    );
}
