
"use client";

import {
    CalendarDays,
    CreditCard,
    Globe,
    Package,
    Truck,
    X,
} from "lucide-react";
import type { OrderStatus } from "@prisma/client";
import type { OrderProduct } from "@/app/types/OrderProduct";

type OrderDetailsSidebarProps = {
    order: OrderProduct | null;
    onCloseAction: () => void;
};

function formatUSD(amount: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
}

function formatDate(date: string | Date) {
    return new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date(date));
}

function statusClass(status: OrderStatus) {
    switch (status) {
        case "PENDING":
            return "border-orange-500/50 bg-orange-400/30 text-[#fb923c]";

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

export const OrderDetailsSidebar = ({
    order,
    onCloseAction,
}: OrderDetailsSidebarProps) => {
    if (!order) return null;

    const payment = order.payments[0];

    const subtotal =
        payment?.totalProductPriceInUSD ??
        order.orderItems.reduce(
            (sum, item) =>
                sum + item.priceAtPurchase * item.quantity,
            0
        );

    const shipping = payment?.shippingCost ?? 0;
    const discount = payment?.discount ?? 0;

    const calculatedTotal = Math.max(
        0,
        subtotal + shipping - discount
    );

    const totalPaid =
        payment && payment.paidAmountInUSD > 0
            ? payment.paidAmountInUSD
            : calculatedTotal;

    const itemCount = order.orderItems.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    return (
        <>
            {/* Backdrop */}
            <button
                type="button"
                aria-label="Close order details"
                onClick={onCloseAction}
                className="fixed inset-0 z-40 cursor-default bg-black/60 backdrop-blur-[2px]"
            />

            {/* Drawer */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-labelledby="order-details-title"
                className="fixed inset-y-0 right-0 z-50 flex w-full max-w-117.5 flex-col border-l border-zinc-800 bg-[#0c0c0c] text-white shadow-2xl light:border-zinc-200 light:bg-white light:text-zinc-900"
            >
                {/* Header */}
                <header className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-5 py-5 light:border-zinc-200">
                    <div>
                        <h2
                            id="order-details-title"
                            className="text-xs font-bold uppercase tracking-[0.15em]"
                        >
                            Order Details
                        </h2>

                        <p className="mt-1 font-mono text-[10px] text-zinc-300">
                            {order.orderCode}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onCloseAction}
                        aria-label="Close"
                        className="text-zinc-400 transition-colors hover:text-white light:hover:text-black"
                    >
                        <X className="size-4" />
                    </button>
                </header>

                {/* Scrollable content */}
                <div className="min-h-0 flex-1 overflow-y-auto p-5">
                    {/* Receipt heading */}
                    <section className="flex items-start justify-between gap-4 border-b border-dashed border-zinc-800 pb-5 light:border-zinc-200">
                        <div>
                            <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-300">
                                Cargo Receipt
                            </p>

                            <h3 className="mt-3 text-xl font-black italic tracking-tight">
                                HYPER<span className="text-second">REAL</span>
                            </h3>

                            <p className="mt-1 font-mono text-[9px] uppercase text-zinc-300">
                                // Techwear Division
                            </p>
                        </div>

                        <div className="text-right">
                            <span
                                className={`inline-flex border px-2 py-1 text-[9px] font-bold uppercase ${statusClass(order.status)}`}
                            >
                                {order.status}
                            </span>

                            <p className="mt-3 flex items-center justify-end gap-1 font-mono text-[10px] text-zinc-300">
                                <CalendarDays className="size-3" />
                                {formatDate(order.createdAt)}
                            </p>
                        </div>
                    </section>

                    {/* Payment / shipping metadata */}
                    <section className="grid grid-cols-3 gap-3 border-b border-dashed border-zinc-800 py-5 light:border-zinc-200">
                        <div className="min-w-0">
                            <p className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-zinc-400">
                                <CreditCard className="size-3" />
                                Gateway
                            </p>

                            <p className="mt-2 wrap-break-word text-[10px] font-bold uppercase">
                                {payment?.method ?? "N/A"}
                            </p>
                        </div>

                        <div className="min-w-0">
                            <p className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-zinc-400">
                                <Truck className="size-3" />
                                Method
                            </p>

                            <p className="mt-2 wrap-break-word text-[10px] font-bold uppercase">
                                {payment?.shippingMethod ?? "N/A"}
                            </p>
                        </div>

                        <div className="min-w-0">
                            <p className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-zinc-400">
                                <Globe className="size-3" />
                                Region
                            </p>

                            <p className="mt-2 wrap-break-word text-[10px] font-bold uppercase">
                                {payment?.country ?? order.orderHistory?.country ?? "N/A"}
                            </p>
                        </div>
                    </section>

                    {/* Customer */}
                    <section className="mt-6">
                        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
                            Drop Coordinates / Customer
                        </h3>

                        <div className="border border-zinc-800 bg-white/2.5 p-4 light:border-zinc-200 light:bg-zinc-50">
                            <p className="text-xs font-bold">
                                {order.orderHistory?.fullName || order.user.name}
                            </p>

                            <p className="mt-1 font-mono text-[10px] text-zinc-100">
                                {order.user.email}
                            </p>

                            {order.orderHistory ? (
                                <div className="mt-2 font-mono text-[10px] leading-relaxed text-zinc-300">
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
                            ) :
                                (
                                    <p className="mt-3 font-mono text-[10px] text-zinc-300">
                                        No shipping address available.
                                    </p>
                                )}
                        </div>
                    </section>

                    {/* Products */}
                    <section className="mt-6">
                        <h3 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
                            <Package className="size-3.5" />
                            Manifest / Products ({itemCount})
                        </h3>

                        <div>
                            {order.orderItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-start justify-between gap-4 border-b border-dashed border-zinc-800 py-3 first:pt-0 last:border-b-0 light:border-zinc-200"
                                >
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold uppercase">
                                            {item.variant.product.name}
                                        </p>

                                        <p className="mt-1 font-mono text-[10px] text-zinc-200">
                                            [{item.variant.size}] × {item.quantity}
                                        </p>

                                        <p className="mt-1 font-mono text-[9px] uppercase text-zinc-200">
                                            {item.variant.color}
                                        </p>
                                    </div>

                                    <p className="shrink-0 font-mono text-[10px] font-bold text-second">
                                        {formatUSD(
                                            item.priceAtPurchase * item.quantity
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Financial summary */}
                    <section className="mt-2 space-y-3 border-t border-dashed border-zinc-800 pt-2 font-mono text-[10px] light:border-zinc-200">
                        <div className="flex justify-between gap-3 text-zinc-400">
                            <span>Subtotal</span>
                            <span className="text-zinc-200">{formatUSD(subtotal)}</span>
                        </div>

                        <div className="flex justify-between gap-3 text-zinc-400">
                            <span>Shipping</span>
                            <span className="text-zinc-200">{formatUSD(shipping)}</span>
                        </div>

                        <div className="flex justify-between gap-3 text-zinc-400">
                            <span>Discount</span>
                            <span className="text-zinc-200">-{formatUSD(discount)}</span>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 border-b border-dashed border-zinc-800 pb-5 pt-2 light:border-zinc-200">
                            <span className="text-xs font-bold uppercase">
                                Total Paid
                            </span>

                            <span className="text-sm font-black text-second">
                                {formatUSD(totalPaid)}
                            </span>
                        </div>

                        {payment && (
                            <div className="flex justify-between gap-3 pt-1 text-zinc-300">
                                <span>Payment status</span>
                                <span className="font-bold uppercase">
                                    {payment.status}
                                </span>
                            </div>
                        )}

                        <p className="pt-3 text-center text-[9px] uppercase tracking-[0.15em] text-zinc-600">
                            End of cargo receipt // HyperReal
                        </p>
                    </section>
                </div>
            </aside>
        </>
    );
};
