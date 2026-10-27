"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, MapPin, Package, Phone, RefreshCw, Search, Truck } from "lucide-react";

type Delivery = {
    id: string;
    trackingCode: string;
    status: "PENDING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "FAILED";
    fulfillmentStatus: string;
    dispatchedAt: string | null;
    deliveredAt: string | null;
    codCollected: boolean;
    deliveryAttempts: number;
    failureReason: string | null;
    deliveryNote: string | null;
    order: {
        id: string;
        orderCode: string;
        orderHistory: {
            fullName: string;
            street: string;
            city: string;
            house: string | null;
            zipCode: string;
            country: string;
            phone: string;
        } | null;
        payments: { method: "STRIPE" | "COD" | "SSLC"; status: string; paidAmountInUSD: number; totalProductPriceInUSD: number; shippingCost: number }[];
        orderItems: { quantity: number; variant: { size: string | null; color: string | null; product: { name: string } } }[];
    };
};

const button = "inline-flex items-center justify-center gap-2 border border-zinc-700 px-3 py-2 text-xs font-bold transition hover:border-lime-400 hover:text-lime-300 disabled:cursor-not-allowed disabled:opacity-40";
const limeButton = "inline-flex items-center justify-center gap-2 bg-lime-400 px-3 py-2 text-xs font-black text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-40";

function money(value: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0);
}

function statusLabel(status: Delivery["status"]) {
    return status.replaceAll("_", " ");
}

export default function CourierDashboard() {
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ACTIVE");
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState("");
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [notes, setNotes] = useState<Record<string, string>>({});

    const loadDeliveries = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch("/api/courier", { cache: "no-store" });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || "Could not load deliveries.");
            setDeliveries(result.data as Delivery[]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not load deliveries.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void loadDeliveries(); }, [loadDeliveries]);

    const visibleDeliveries = useMemo(() => {
        const query = search.trim().toLowerCase();
        return deliveries.filter((delivery) => {
            const address = delivery.order.orderHistory;
            const matchesSearch = !query ||
                delivery.order.orderCode.toLowerCase().includes(query) ||
                delivery.trackingCode.toLowerCase().includes(query) ||
                (address?.fullName || "").toLowerCase().includes(query) ||
                (address?.city || "").toLowerCase().includes(query);
            const matchesFilter = filter === "ALL" ||
                (filter === "ACTIVE" && delivery.status !== "DELIVERED") ||
                delivery.status === filter;
            return matchesSearch && matchesFilter;
        });
    }, [deliveries, search, filter]);

    const updateDelivery = async (delivery: Delivery, action: string) => {
        setBusyId(delivery.id);
        setError("");
        setNotice("");
        try {
            const response = await fetch("/api/courier", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shipmentId: delivery.id, action, note: notes[delivery.id] || "" }),
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || "Could not update delivery.");
            setNotice(result.message || "Delivery updated.");
            await loadDeliveries();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not update delivery.");
        } finally {
            setBusyId("");
        }
    };

    const activeCount = deliveries.filter((delivery) => delivery.status !== "DELIVERED").length;
    const deliveredCount = deliveries.filter((delivery) => delivery.status === "DELIVERED").length;
    const failedCount = deliveries.filter((delivery) => delivery.status === "FAILED").length;

    return (
        <main className="min-h-screen bg-[#080808] px-4 py-6 text-zinc-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-zinc-800 pb-5">
                    <div>
                        <p className="mb-2 text-[10px] font-black tracking-[0.25em] text-lime-400">HYPERREAL / LOGISTICS</p>
                        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Courier <span className="text-lime-400">Dashboard</span></h1>
                        <p className="mt-2 text-sm text-zinc-500">Manage your assigned parcels and delivery outcomes.</p>
                    </div>
                    <button type="button" onClick={() => void loadDeliveries()} disabled={loading} className={button}>
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                </header>

                <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                        { label: "ACTIVE DELIVERIES", value: activeCount, icon: Truck },
                        { label: "DELIVERED", value: deliveredCount, icon: CheckCircle2 },
                        { label: "FAILED ATTEMPTS", value: failedCount, icon: AlertCircle },
                    ].map((stat) => {
                        const Icon = stat.icon;
                        return <div key={stat.label} className="border border-zinc-800 bg-[#0d0d0d] p-4"><div className="flex items-center justify-between text-[10px] font-bold tracking-widest text-zinc-500"><span>{stat.label}</span><Icon size={16} className="text-lime-400" /></div><p className="mt-3 text-3xl font-black">{stat.value}</p></div>;
                    })}
                </section>

                {(error || notice) && <div className={`mb-4 border px-4 py-3 text-sm ${error ? "border-red-900 bg-red-950/30 text-red-300" : "border-lime-900 bg-lime-950/20 text-lime-300"}`}>{error || notice}</div>}

                <section className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_180px]">
                    <label className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order, tracking code, customer, city" className="w-full border border-zinc-800 bg-[#0d0d0d] py-2 pl-9 pr-3 text-sm outline-none focus:border-lime-400" /></label>
                    <select value={filter} onChange={(event) => setFilter(event.target.value)} className="border border-zinc-800 bg-[#0d0d0d] px-3 py-2 text-xs"><option value="ACTIVE">Active deliveries</option><option value="ALL">All deliveries</option><option value="PENDING">Awaiting delivery</option><option value="OUT_FOR_DELIVERY">Out for delivery</option><option value="FAILED">Failed attempts</option><option value="DELIVERED">Delivered</option></select>
                </section>

                {loading ? <div className="border border-zinc-800 py-16 text-center text-sm text-zinc-500"><RefreshCw className="mx-auto mb-3 animate-spin" />Loading assigned deliveries...</div> : visibleDeliveries.length === 0 ? <div className="border border-dashed border-zinc-800 py-16 text-center"><Package className="mx-auto mb-3 text-zinc-600" /><p className="font-bold">No assigned deliveries</p><p className="mt-1 text-sm text-zinc-500">Deliveries assigned to your account will appear here.</p></div> : (
                    <div className="space-y-3">
                        {visibleDeliveries.map((delivery) => {
                            const address = delivery.order.orderHistory;
                            const payment = delivery.order.payments[0];
                            const busy = busyId === delivery.id;
                            const active = delivery.status === "OUT_FOR_DELIVERY";
                            const canStart = delivery.fulfillmentStatus === "DISPATCHED" && ["PENDING", "FAILED"].includes(delivery.status);
                            const addressText = address ? [address.house, address.street, address.city, address.zipCode, address.country].filter(Boolean).join(", ") : "Address unavailable";
                            return (
                                <article key={delivery.id} className="border border-zinc-800 bg-[#0d0d0d]">
                                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 p-4">
                                        <div><p className="text-xs font-black text-lime-300">{delivery.order.orderCode}</p><p className="mt-1 text-[10px] text-zinc-500">{delivery.trackingCode}</p></div>
                                        <span className={`border px-2 py-1 text-[10px] font-bold ${delivery.status === "DELIVERED" ? "border-lime-800 text-lime-300" : delivery.status === "FAILED" ? "border-red-900 text-red-300" : active ? "border-sky-900 text-sky-300" : "border-zinc-700 text-zinc-400"}`}>{statusLabel(delivery.status)}</span>
                                    </div>
                                    <div className="grid gap-4 p-4 md:grid-cols-[1fr_1fr]">
                                        <div className="space-y-3">
                                            <div><p className="text-[9px] font-bold tracking-widest text-zinc-500">CUSTOMER</p><p className="mt-1 font-bold">{address?.fullName || "Customer"}</p><p className="mt-1 flex items-start gap-2 text-sm text-zinc-400"><MapPin size={15} className="mt-0.5 shrink-0" />{addressText}</p>{address?.phone && <a href={`tel:${address.phone}`} className="mt-2 inline-flex items-center gap-2 text-sm text-lime-300"><Phone size={14} />{address.phone}</a>}</div>
                                            <div><p className="text-[9px] font-bold tracking-widest text-zinc-500">PARCEL ITEMS</p><ul className="mt-1 space-y-1 text-sm text-zinc-300">{delivery.order.orderItems.map((item,index)=><li key={index}>{item.quantity} × {item.variant.product.name} <span className="text-xs text-zinc-500">({item.variant.size || "—"} / {item.variant.color || "—"})</span></li>)}</ul></div>
                                        </div>
                                        <div className="space-y-3 border-t border-zinc-800 pt-4 md:border-l md:border-t-0 md:pl-4 md:pt-0">
                                            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Payment</span><span>{payment?.method || "—"} · {payment?.status || "—"}</span></div>
                                            {payment?.method === "COD" && <div className="flex items-center justify-between border border-zinc-800 p-3 text-sm"><span>Cash to collect</span><strong>{money(Number(payment.totalProductPriceInUSD) + Number(payment.shippingCost))}</strong></div>}
                                            {delivery.failureReason && <p className="border border-red-900/60 bg-red-950/20 p-3 text-xs text-red-300">Last attempt: {delivery.failureReason}</p>}
                                            {delivery.status !== "DELIVERED" && <textarea value={notes[delivery.id] || ""} onChange={(event)=>setNotes((current)=>({...current,[delivery.id]:event.target.value}))} rows={2} placeholder="Delivery note or failed attempt reason..." className="w-full resize-y border border-zinc-800 bg-black p-3 text-sm outline-none focus:border-lime-400" />}
                                            <div className="flex flex-wrap gap-2">
                                                {canStart && <button type="button" onClick={()=>void updateDelivery(delivery,"START_DELIVERY")} disabled={busy} className={limeButton}><Truck size={14}/>{busy?"Updating...":"Start delivery"}</button>}
                                                {active && payment?.method === "COD" && !delivery.codCollected && <button type="button" onClick={()=>void updateDelivery(delivery,"COLLECT_COD")} disabled={busy} className={button}><CheckCircle2 size={14}/>Confirm cash collected</button>}
                                                {active && <button type="button" onClick={()=>void updateDelivery(delivery,"MARK_DELIVERED")} disabled={busy || (payment?.method === "COD" && !delivery.codCollected)} className={limeButton}><CheckCircle2 size={14}/>Mark delivered</button>}
                                                {active && <button type="button" onClick={()=>void updateDelivery(delivery,"MARK_FAILED")} disabled={busy || !(notes[delivery.id] || "").trim()} className={button}><AlertCircle size={14}/>Delivery failed</button>}
                                            </div>
                                            {delivery.deliveredAt && <p className="text-xs text-zinc-500"><Clock3 className="mr-1 inline" size={13}/>Delivered {new Date(delivery.deliveredAt).toLocaleString()}</p>}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
