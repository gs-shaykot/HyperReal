"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ChevronDown, Clock3, RefreshCw } from "lucide-react";

type Order = {
  id: string;
  orderCode: string;
  status: string;
  shipment: { status: string; deliveredAt: string | null } | null;
  orderItems: Array<{
    id: string;
    quantity: number;
    priceAtPurchase: number;
    variant: { size: string; color: string; product: { name: string } };
  }>;
};

type ReturnRow = {
  id: string;
  returnCode: string;
  status: string;
  reason: string;
  createdAt: string;
  customerNote?: string | null;
  order: { orderCode: string };
  items: Array<{
    requestedQuantity: number;
    orderItem: {
      priceAtPurchase: number;
      variant: { product: { name: string }; size: string; color: string };
    };
  }>;
  events: Array<{
    title: string;
    description?: string | null;
    createdAt: string;
  }>;
  refund?: {
    status: string;
    amount: string | number;
    currency: string;
    method: string;
  } | null;
};

const reasons = [
  "WRONG_ITEM",
  "DAMAGED",
  "DEFECTIVE",
  "SIZE_ISSUE",
  "NOT_AS_DESCRIBED",
  "CHANGED_MIND",
  "OTHER",
];

const label = (value: string) => value.replaceAll("_", " ");

export default function AccountReturnsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<ReturnRow[]>([]);
  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState("SIZE_ISSUE");
  const [note, setNote] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [expandedReturns, setExpandedReturns] = useState<
    Record<string, boolean>
  >({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    setBusy(true);
    setError("");

    try {
      const [ordersResponse, returnsResponse] = await Promise.all([
        fetch("/api/account/orders/return-eligible", { cache: "no-store" }),
        fetch("/api/account/returns", { cache: "no-store" }),
      ]);
      const ordersJson = await ordersResponse.json();
      const returnsJson = await returnsResponse.json();

      if (!ordersResponse.ok) {
        throw new Error(ordersJson.message || "Could not load eligible orders");
      }
      if (!returnsResponse.ok) {
        throw new Error(returnsJson.message || "Could not load returns");
      }

      setOrders(ordersJson.data || []);
      setReturns(returnsJson.data || []);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not load returns",
      );
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const selected = orders.find((order) => order.id === orderId);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected) {
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const items = selected.orderItems
        .filter((item) => (quantities[item.id] || 0) > 0)
        .map((item) => ({
          orderItemId: item.id,
          quantity: quantities[item.id],
        }));
      const response = await fetch("/api/account/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, reason, customerNote: note, items }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not submit return");
      }

      setMessage("Return request submitted successfully.");
      setOrderId("");
      setQuantities({});
      setNote("");
      await load();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not submit return",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 text-white light:text-zinc-900">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[.2em] text-second">
            AFTER-SALES / SUPPORT
          </p>
          <h1 className="mt-2 text-2xl font-black">Returns & Refunds</h1>
          <p className="mt-1 text-sm text-zinc-400 light:text-zinc-600">
            Request a return within 7 days of confirmed delivery and track its
            progress.
          </p>
        </div>
        <button
          onClick={() => void load()}
          disabled={busy}
          className="flex items-center gap-2 border border-zinc-700 px-3 py-2 text-xs"
        >
          <RefreshCw size={14} className={busy ? "animate-spin" : ""} /> Refresh
        </button>
      </header>

      <div className="border border-second/40 bg-second/5 p-4">
        <p className="text-sm font-bold">7-day return policy</p>
        <p className="mt-1 text-xs text-zinc-400 light:text-zinc-600">
          The return window begins when delivery is confirmed in shipment
          tracking. Returned items are inspected before the final refund amount
          is confirmed.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300"
        >
          {error}
        </p>
      )}
      {message && (
        <p className="border border-lime-500/40 bg-lime-500/10 p-3 text-sm text-lime-300">
          {message}
        </p>
      )}

      <section className="border border-zinc-700 p-4">
        <h2 className="font-bold">Start a return</h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-400">
            No eligible delivered orders are currently available.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-4">
            <label className="block text-xs font-bold">
              SELECT ORDER
              <select
                required
                value={orderId}
                onChange={(event) => {
                  setOrderId(event.target.value);
                  setQuantities({});
                }}
                className="mt-2 w-full border border-zinc-700 bg-main p-3 text-sm text-white scheme-dark light:border-gray-300 light:bg-white light:text-zinc-900 light:scheme-light"
              >
                <option
                  value=""
                  className="bg-dark text-white light:bg-white light:text-zinc-900"
                >
                  Choose a delivered order
                </option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.orderCode} · delivered{" "}
                    {order.shipment?.deliveredAt
                      ? new Date(
                          order.shipment.deliveredAt,
                        ).toLocaleDateString()
                      : ""}
                  </option>
                ))}
              </select>
            </label>

            {selected && (
              <div className="space-y-2">
                {selected.orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 border border-zinc-800 p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {item.variant.product.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {item.variant.size} / {item.variant.color} · purchased{" "}
                        {item.quantity}
                      </p>
                    </div>
                    <label className="text-xs">
                      Return qty
                      <input
                        type="number"
                        min="0"
                        max={item.quantity}
                        value={quantities[item.id] || 0}
                        onChange={(event) =>
                          setQuantities((current) => ({
                            ...current,
                            [item.id]: Math.max(
                              0,
                              Math.min(
                                item.quantity,
                                Number(event.target.value) || 0,
                              ),
                            ),
                          }))
                        }
                        className="ml-2 w-16 border border-zinc-700 bg-main p-2 text-white light:border-gray-300 light:bg-white light:text-zinc-900"
                      />
                    </label>
                  </div>
                ))}
              </div>
            )}

            <label className="block text-xs font-bold">
              REASON
              <select
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="mt-2 w-full border border-zinc-700 bg-main p-3 text-sm text-white scheme-dark light:border-gray-300 light:bg-white light:text-zinc-900 light:scheme-light"
              >
                {reasons.map((returnReason) => (
                  <option key={returnReason} value={returnReason}>
                    {label(returnReason)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-bold">
              ADDITIONAL DETAILS
              <textarea
                rows={3}
                maxLength={2000}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="mt-2 w-full border border-zinc-700 bg-main p-3 text-sm text-white scheme-dark light:border-gray-300 light:bg-white light:text-zinc-900 light:scheme-light"
                placeholder="Tell us what happened (optional)"
              />
            </label>

            <button
              disabled={
                busy ||
                !selected ||
                !Object.values(quantities).some((value) => value > 0)
              }
              className="bg-second px-5 py-3 text-xs font-black tracking-widest text-zinc-900 disabled:opacity-40"
            >
              {busy ? "SUBMITTING..." : "SUBMIT RETURN REQUEST"}
            </button>
          </form>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">Your return history</h2>
          <span className="text-xs text-zinc-500">
            {returns.length} request(s)
          </span>
        </div>

        {returns.length === 0 ? (
          <div className="border border-dashed border-zinc-700 p-8 text-center text-sm text-zinc-500">
            Your return requests and refund updates will appear here.
          </div>
        ) : (
          <div className="space-y-3">
            {returns.map((returnRow) => {
              const isRefunded =
                returnRow.refund?.status === "SUCCEEDED" ||
                returnRow.status === "REFUNDED";
              const isExpanded = expandedReturns[returnRow.id] ?? !isRefunded;

              return (
                <article
                  key={returnRow.id}
                  className="border border-zinc-700 p-4"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedReturns((current) => ({
                        ...current,
                        [returnRow.id]: !isExpanded,
                      }))
                    }
                    className="flex w-full cursor-pointer flex-wrap items-start justify-between gap-2 text-left hover:text-second"
                  >
                    <div>
                      <p className="font-bold">{returnRow.returnCode}</p>
                      <p className="text-xs text-zinc-500">
                        {returnRow.order.orderCode} ·{" "}
                        {new Date(returnRow.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="border border-second/60 px-2 py-1 text-[10px] font-bold text-second">
                        {label(returnRow.status)}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`${isExpanded ? "rotate-180" : ""} transition-transform`}
                      />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-3">
                      <div className="mt-3 space-y-1">
                        {returnRow.items.map((item, index) => (
                          <p key={index} className="text-xs text-zinc-400">
                            {item.orderItem.variant.product.name} · qty{" "}
                            {item.requestedQuantity}
                          </p>
                        ))}
                      </div>

                      {returnRow.refund && (
                        <div className="mt-3 border border-zinc-700 p-3 text-xs">
                          <p className="font-bold">
                            Refund: {label(returnRow.refund.status)}
                          </p>
                          <p className="mt-1 text-zinc-400">
                            {returnRow.refund.currency}{" "}
                            {Number(returnRow.refund.amount).toFixed(2)} ·{" "}
                            {returnRow.refund.method}
                          </p>
                        </div>
                      )}

                      <div className="mt-4 border-t border-zinc-800 pt-3">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedReturns((current) => ({
                              ...current,
                              [returnRow.id]: !current[returnRow.id],
                            }))
                          }
                          className="flex w-full items-center justify-between gap-3 py-2 text-left hover:text-second"
                        >
                          <span>
                            <span className="block text-xs font-bold">
                              Activity
                            </span>
                            <span className="block text-[11px] text-zinc-500">
                              {returnRow.events.length
                                ? returnRow.events[returnRow.events.length - 1]
                                    .title
                                : "No activity"}{" "}
                              · {returnRow.events.length} events
                            </span>
                          </span>
                          <ChevronDown
                            size={15}
                            className={
                              expandedReturns[returnRow.id]
                                ? "rotate-180 transition-transform"
                                : "transition-transform"
                            }
                          />
                        </button>

                        {expandedReturns[returnRow.id] && (
                          <div className="mt-2 space-y-1">
                            {returnRow.events.map((event) => (
                              <div
                                key={event.title + event.createdAt}
                                className="flex gap-2 py-1"
                              >
                                <Clock3
                                  size={13}
                                  className="mt-0.5 shrink-0 text-second"
                                />
                                <div>
                                  <p className="text-xs font-semibold">
                                    {event.title}
                                  </p>
                                  <p className="text-[11px] text-zinc-500">
                                    {event.description} ·{" "}
                                    {new Date(event.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
