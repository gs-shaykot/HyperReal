"use client";

import { OrderFilters } from "@/app/(Routes)/account/orders/OrderFilters";
import { OrderModal } from "@/app/(Routes)/account/orders/OrderModal";
import { orderDetailsSelect } from "@/lib/prisma/orderSelect";
import { Prisma } from "@prisma/client";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClockArrowUp,
  Eye,
  Hourglass,
  OctagonX,
  Package,
  PackageCheck,
  Plus,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export type OrderType = Prisma.OrderGetPayload<{
  select: typeof orderDetailsSelect;
}>;

export const AllOrder = ({ orders }: { orders: OrderType[] }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [payment, setPayment] = useState("ALL");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const orderCode = new URLSearchParams(window.location.search).get("order");
    if (!orderCode) return;

    const matchingOrder = orders.find(
      (order) =>
        order.orderCode.toLowerCase() === orderCode.toLowerCase() ||
        order.id === orderCode,
    );

    if (matchingOrder) {
      const timeoutId = window.setTimeout(() => {
        setSelectedOrderId(matchingOrder.id);
        setOpen(true);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [orders]);

  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) ?? null;

  const refreshSelectedOrder = async () => {
    router.refresh();
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 700);
    });
  };

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.orderCode.toLowerCase().includes(query) ||
        order.orderItems.some((item) =>
          item.variant.product.name.toLowerCase().includes(query),
        );

      const matchesStatus = status === "ALL" || order.status === status;
      const matchesPayment =
        payment === "ALL" ||
        order.payments.some((entry) =>
          payment === "COD" ? entry.method === "COD" : entry.status === payment,
        );

      const orderDate = new Date(order.createdAt);
      const localDate = [
        orderDate.getFullYear(),
        String(orderDate.getMonth() + 1).padStart(2, "0"),
        String(orderDate.getDate()).padStart(2, "0"),
      ].join("-");
      const matchesDate = !date || localDate === date;

      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });
  }, [orders, search, status, payment, date]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const clearFilters = () => {
    setPage(1);
    setSearch("");
    setStatus("ALL");
    setPayment("ALL");
    setDate("");
  };

  const updateSearch = (value: string) => {
    setPage(1);
    setSearch(value);
  };

  const updateStatus = (value: string) => {
    setPage(1);
    setStatus(value);
  };

  const updatePayment = (value: string) => {
    setPage(1);
    setPayment(value);
  };

  const updateDate = (value: string) => {
    setPage(1);
    setDate(value);
  };

  const orderStatus = [
    {
      status: "PENDING",
      icon: Hourglass,
      className: "border-yellow-500 text-yellow-500",
    },
    {
      status: "PROCESSING",
      icon: ClockArrowUp,
      className: "border-orange-400 text-orange-400",
    },
    {
      status: "SHIPPED",
      icon: Truck,
      className: "border-sky-400 text-sky-400",
    },
    {
      status: "DELIVERED",
      icon: PackageCheck,
      className: "border-second text-second",
    },
    {
      status: "CANCELLED",
      icon: OctagonX,
      className: "border-red-500 text-red-500",
    },
  ];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-2xl font-bold italic light:text-zinc-900 text-white">
          Order<span className="text-second"> History</span>
        </h2>
        <h2 className="text-xs text-zinc-500 light:text-zinc-800">
          {filteredOrders.length} / {orders.length} TRANSMISSIONS
        </h2>
      </div>

      <OrderFilters
        search={search}
        onSearchChange={updateSearch}
        status={status}
        onStatusChange={updateStatus}
        payment={payment}
        onPaymentChange={updatePayment}
        date={date}
        onDateChange={updateDate}
        onClear={clearFilters}
      />

      <OrderModal
        open={open}
        onCloseAction={() => setOpen(false)}
        order={selectedOrder}
        onRefreshAction={refreshSelectedOrder}
      />

      {filteredOrders.length > 0 ? (
        <>
          <div>
            {paginatedOrders.map((order) => (
              <div
                key={order.id}
                className="mb-3 flex flex-col items-start border border-zinc-700 p-4 transition-all duration-150 hover:border-second md:flex-row md:items-center md:justify-between"
              >
                <div className="flex flex-col space-y-2 md:space-y-2">
                  <div className="flex w-68 items-center gap-2">
                    <h2 className="font-bold light:text-zinc-900 text-white">
                      {order.orderCode}
                    </h2>
                    <h3 className="flex justify-start gap-1">
                      {orderStatus.map(
                        (stat) =>
                          stat.status === order.status && (
                            <span
                              key={stat.status}
                              className={`flex shrink-0 items-center rounded-full border p-1 text-xs ${stat.className}`}
                            >
                              <stat.icon className="mr-1 h-4 w-4" />
                              {stat.status}
                            </span>
                          ),
                      )}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-zinc-400 light:text-zinc-700">
                    <h3 className="flex items-center justify-between gap-1">
                      <CalendarDays size={16} />
                      {order.createdAt.toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "numeric",
                        year: "numeric",
                      })}
                    </h3>
                    <span className="h-2 w-2 rounded-full border border-second" />
                    <h3>{order.orderItems.length} ITEMS</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.orderItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center bg-zinc-900 px-2 py-1 text-xs text-zinc-400 light:bg-zinc-200 light:text-zinc-900"
                      >
                        <h3>{item.variant.product.name}</h3>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between gap-3 text-sm md:mt-0 md:text-base">
                  <div className="flex items-center justify-center md:flex-col">
                    <h3 className="text-zinc-400 light:text-zinc-700">TOTAL:</h3>
                    <h3 className="text-second">
                      ${order.payments[0]?.totalProductPriceInUSD.toFixed(2)}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedOrderId(order.id);
                      setOpen(true);
                    }}
                    className="btn btn-xs rounded-none border border-zinc-700 transition-all duration-300 hover:bg-white hover:text-zinc-900 light:text-zinc-900 light:hover:bg-main light:hover:text-white md:btn-sm"
                  >
                    <Eye className="h-4 w-4 md:h-auto md:w-auto" />
                    VIEW
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredOrders.length > pageSize && (
            <div className="flex flex-wrap items-center justify-between gap-3 border border-zinc-800 px-3 py-3 text-xs light:border-zinc-200">
              <span className="font-mono text-[10px] text-zinc-500">
                PAGE {page} / {totalPages} · {filteredOrders.length} ORDERS
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((current) => Math.max(1, current - 1))
                  }
                  className="flex items-center gap-1 border border-zinc-700 px-3 py-2 font-mono text-[10px] uppercase text-zinc-400 hover:border-second disabled:opacity-30 light:border-zinc-300"
                >
                  <ChevronLeft className="size-3" /> Prev
                </button>
                <span className="border border-second bg-second px-3 py-2 font-mono text-[10px] text-black">
                  {page}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  className="flex items-center gap-1 border border-zinc-700 px-3 py-2 font-mono text-[10px] uppercase text-zinc-400 hover:border-second disabled:opacity-30 light:border-zinc-300"
                >
                  Next <ChevronRight className="size-3" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex h-52 flex-col items-center justify-center gap-4 border border-dashed border-zinc-700 p-4">
          <span className="rounded-full border border-second p-2">
            <Plus />
          </span>
          <p className="text-zinc-400">
            {orders.length === 0
              ? "No orders to display yet. Your order history will appear here once you place a purchase."
              : "No orders match these filters. Try changing your search or clearing the filters."}
          </p>
          <Link
            href="/products"
            className="light:text-white text-black group relative flex btn rounded-none border-0 bg-second font-bold shadow-none transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(163,230,53,0.8)]"
          >
            <span className="flex items-center gap-2">
              <Package className="transition-transform duration-300 group-hover:translate-x-1" />
              BROWSE CATALOG
            </span>
          </Link>
        </div>
      )}
    </div>
  );
};
