import type { OrderStatus } from "@prisma/client";

interface RecentOrder {
    id: string;
    orderCode: string;
    customerName: string;
    status: OrderStatus;
    amount: number;
    createdAt: Date;
}

interface RecentOrdersProps {
    orders: RecentOrder[];
    total: number;
}

const statusStyles: Record<OrderStatus, string> = {
    PENDING:
        "border-yellow-500/40 bg-yellow-500/10 text-yellow-400",

    PROCESSING:
        "border-amber-500/40 bg-amber-500/10 text-amber-400",

    SHIPPED:
        "border-blue-500/40 bg-blue-500/10 text-blue-400",

    DELIVERED:
        "border-second/40 bg-second/10 text-second",

    CANCELLED:
        "border-red-500/40 bg-red-500/10 text-red-500",
};

export const RecentOrders = ({
    orders,
    total,
}: RecentOrdersProps) => {
    return (
        <section className="w-full border border-white/10 bg-dark p-6 light:border-black/10 light:bg-white">

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-sm font-bold tracking-widest text-white light:text-zinc-900">
                    RECENT ORDERS
                </h2>

                <span className="text-xs text-gray-500">
                    {total} total
                </span>
            </div>

            {/* Orders */}
            <div>
                {orders.map((order, index) => (
                    <div
                        key={order.id}
                        className={`flex items-center justify-between py-1.5 ${
                            index !== orders.length - 1
                                ? "border-b border-white/10 light:border-black/10"
                                : ""
                        }`}
                    >
                        {/* Order information */}
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-white light:text-zinc-900">
                                {order.orderCode}
                            </p>

                            <p className="mt-1 truncate text-xs text-gray-500">
                                {order.customerName}
                            </p>
                        </div>

                        {/* Amount + status */}
                        <div className="flex shrink-0 items-center gap-4">

                            <span className="text-xs font-bold text-white light:text-zinc-900">
                                $
                                {order.amount.toLocaleString(
                                    "en-US",
                                    {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 2,
                                    }
                                )}
                            </span>

                            <span
                                className={`min-w-27 border px-3 py-1.5 text-center text-[10px] font-bold tracking-wider ${
                                    statusStyles[order.status]
                                }`}
                            >
                                {order.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};