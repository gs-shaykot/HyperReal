
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
    AlertCircle,
    ArrowRight,
    Check,
    CheckCircle2,
    ClipboardList,
    LoaderCircle,
    Package,
    PackageCheck,
    RefreshCw,
    ScanLine,
    Search,
    Truck,
} from "lucide-react";

type ItemCheck = {
    id: string;
    orderItemId: string;
    verified: boolean;
    verifiedAt: string | null;
};

type OrderItem = {
    id: string;
    quantity: number;
    priceAtPurchase: number;
    variant: {
        size: string;
        color: string;
        product: { id: string; name: string };
    };
};

type Shipment = {
    id: string;
    trackingCode: string;
    fulfillmentStatus: "READY_TO_PACK" | "PACKING" | "PACKED" | "DISPATCHED";
    status: "PENDING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "FAILED";
    itemChecks: ItemCheck[];
    assignedCourier: { id: string; name: string | null } | null;
    events: { id: string; title: string; createdAt: string }[];
};

type Order = {
    id: string;
    orderCode: string;
    status: string;
    createdAt: string;
    user: { id: string; name: string; email: string };
    orderHistory: {
        fullName: string;
        street: string;
        city: string;
        house: string;
        zipCode: string;
        country: string;
        phone: string;
    } | null;
    orderItems: OrderItem[];
    payments: {
        method: string;
        status: string;
        paidAmountInUSD: number;
    }[];
    shipment: Shipment | null;
};

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

const tabs = [
    { label: "All Orders", value: "ALL" },
    { label: "Ready to Pack", value: "READY_TO_PACK" },
    { label: "Packing", value: "PACKING" },
    { label: "Packed", value: "PACKED" },
    { label: "Dispatched", value: "DISPATCHED" },
];

const statusStyles: Record<string, string> = {
    READY_TO_PACK: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
    PACKING: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    PACKED: "border-violet-500/30 bg-violet-500/10 text-violet-400",
    DISPATCHED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
};

export default function FulfillmentDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("ALL");
    const [selected, setSelected] = useState<Order | null>(null);
    const [scanOpen, setScanOpen] = useState(false);
    const [lookup, setLookup] = useState("");
    const [scanLoading, setScanLoading] = useState(false);
    const [scanResult, setScanResult] = useState<Order | null>(null);
    const [newToken, setNewToken] = useState<string | null>(null);

    const loadOrders = useCallback(async () => {
        setLoading(true);

        try {
            const response = await fetch("/api/admin/fulfillment", {
                cache: "no-store",
            });
            const result: ApiResponse<Order[]> = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Could not load fulfillment orders.");
            }

            setOrders(result.data);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Could not load orders.",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadOrders();
    }, [loadOrders]);

    const filteredOrders = useMemo(() => {
        const query = search.trim().toLowerCase();

        return orders.filter((order) => {
            const matchesSearch =
                !query ||
                order.orderCode.toLowerCase().includes(query) ||
                order.user.name?.toLowerCase().includes(query) ||
                order.user.email.toLowerCase().includes(query) ||
                order.shipment?.trackingCode.toLowerCase().includes(query);

            const status = order.shipment?.fulfillmentStatus ?? "READY_TO_PACK";
            const matchesTab =
                activeTab === "ALL" ||
                status === activeTab ||
                (activeTab === "READY_TO_PACK" && !order.shipment);

            return matchesSearch && matchesTab;
        });
    }, [orders, search, activeTab]);

    const stats = useMemo(() => {
        const count = (status: string) =>
            orders.filter((order) => {
                const shipmentStatus =
                    order.shipment?.fulfillmentStatus ?? "READY_TO_PACK";
                return shipmentStatus === status;
            }).length;

        return [
            { label: "READY TO PACK", value: count("READY_TO_PACK"), icon: Package },
            { label: "CURRENTLY PACKING", value: count("PACKING"), icon: ClipboardList },
            { label: "PACKED", value: count("PACKED"), icon: PackageCheck },
            { label: "AWAITING DISPATCH", value: count("DISPATCHED"), icon: Truck },
        ];
    }, [orders]);

    async function postAction(body: Record<string, string>) {
        const response = await fetch("/api/admin/fulfillment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "The action failed.");
        }

        return result;
    }

    async function runAction(
        order: Order,
        action: string,
        orderItemId?: string,
    ) {
        const shipmentId = order.shipment?.id;

        if (action !== "CREATE_SHIPMENT" && !shipmentId) {
            toast.error("Create a shipment first.");
            return;
        }

        const key = `${order.id}-${action}-${orderItemId ?? ""}`;
        setBusy(key);

        try {
            if (action === "CREATE_SHIPMENT") {
                const result = await postAction({
                    action,
                    orderId: order.id,
                });

                const token = result.data?.parcelToken as string | undefined;
                setNewToken(token ?? null);

                if (token) {
                    toast.success("Shipment created. Copy the parcel token now.");
                } else {
                    toast.success("Shipment already exists.");
                }
            } else {
                await postAction({
                    action,
                    shipmentId: shipmentId!,
                    ...(orderItemId ? { orderItemId } : {}),
                });

                const messages: Record<string, string> = {
                    START_PACKING: "Packing started.",
                    VERIFY_ITEM: "Item verified.",
                    MARK_PACKED: "Parcel marked as packed.",
                    DISPATCH: "Parcel dispatched.",
                };

                toast.success(messages[action] ?? "Updated.");
            }

            await loadOrders();

            if (selected?.id === order.id) {
                setSelected(null);
            }
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Action failed.",
            );
        } finally {
            setBusy(null);
        }
    }

    async function scanParcel() {
        if (!lookup.trim()) {
            toast.error("Enter an order code, tracking code, or parcel token.");
            return;
        }

        setScanLoading(true);
        setScanResult(null);

        try {
            const response = await fetch("/api/admin/fulfillment/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    lookup.trim().startsWith("HYP-PRT-")
                        ? { token: lookup.trim() }
                        : { lookup: lookup.trim() },
                ),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Parcel not found.");
            }

            const orderId = result.data.order.id;
            const matchedOrder = orders.find((order) => order.id === orderId);

            if (matchedOrder) {
                setScanResult(matchedOrder);
            } else {
                toast.success(`Found ${result.data.order.orderCode}. Refreshing orders…`);
                await loadOrders();
                setScanResult(null);
            }

            toast.success(`Parcel ${result.data.trackingCode} found.`);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Parcel lookup failed.",
            );
        } finally {
            setScanLoading(false);
        }
    }

    function openDetails(order: Order) {
        setSelected(order);
        setNewToken(null);
    }

    return (
        <div className="space-y-5 text-white light:text-zinc-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-semibold tracking-[0.25em] text-cyan-400">
                        HYPERREAL / OPERATIONS
                    </p>
                    <h1 className="mt-1 text-2xl font-bold tracking-wide">
                        Fulfillment
                    </h1>
                    <p className="mt-1 text-sm text-zinc-400 light:text-zinc-500">
                        Verify, pack, and dispatch customer orders.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => {
                            setScanOpen(true);
                            setLookup("");
                            setScanResult(null);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2.5 text-sm hover:border-cyan-400 hover:text-cyan-400"
                    >
                        <ScanLine size={17} />
                        Scan Parcel
                    </button>
                    <button
                        onClick={() => void loadOrders()}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-cyan-400 disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <div
                            key={stat.label}
                            className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 light:border-zinc-200 light:bg-white"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold tracking-wider text-zinc-400">
                                    {stat.label}
                                </span>
                                <Icon size={18} className="text-cyan-400" />
                            </div>
                            <p className="mt-3 text-3xl font-bold tabular-nums">
                                {stat.value}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 light:border-zinc-200 light:bg-white">
                <div className="flex flex-col gap-4 border-b border-zinc-800 p-4 light:border-zinc-200">
                    <div className="flex flex-wrap gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setActiveTab(tab.value)}
                                className={`rounded-lg px-3 py-2 text-sm transition ${activeTab === tab.value
                                        ? "bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-400/40"
                                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white light:hover:bg-zinc-100 light:hover:text-zinc-900"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative max-w-lg">
                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                        />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search order, customer, email, or tracking code..."
                            className="w-full rounded-lg border border-zinc-700 bg-black py-2.5 pl-10 pr-3 text-sm outline-none focus:border-cyan-400 light:border-zinc-300 light:bg-white"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-225 text-left text-sm">
                        <thead className="bg-zinc-900/70 text-xs uppercase tracking-wider text-zinc-400 light:bg-zinc-50">
                            <tr>
                                <th className="px-4 py-3">Order / Tracking</th>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Items</th>
                                <th className="px-4 py-3">Payment</th>
                                <th className="px-4 py-3">Fulfillment</th>
                                <th className="px-4 py-3">Created</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800 light:divide-zinc-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-zinc-400">
                                        <LoaderCircle className="mx-auto mb-2 animate-spin" />
                                        Loading fulfillment orders…
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-zinc-400">
                                        No orders match these filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => {
                                    const shipment = order.shipment;
                                    const status = shipment?.fulfillmentStatus ?? "READY_TO_PACK";
                                    const actionKey = `${order.id}-CREATE_SHIPMENT-`;

                                    return (
                                        <tr key={order.id} className="hover:bg-white/2.5 light:hover:bg-zinc-50">
                                            <td className="px-4 py-4">
                                                <p className="font-semibold">{order.orderCode}</p>
                                                <p className="mt-1 text-xs text-cyan-400">
                                                    {shipment?.trackingCode ?? "Shipment not created"}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p>{order.orderHistory?.fullName ?? order.user.name}</p>
                                                <p className="mt-1 text-xs text-zinc-500">{order.user.email}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p>{order.orderItems.length} line item(s)</p>
                                                <p className="mt-1 text-xs text-zinc-500">
                                                    {order.orderItems.reduce((total, item) => total + item.quantity, 0)} unit(s)
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p>{order.payments[0]?.method ?? "—"}</p>
                                                <p className="mt-1 text-xs text-zinc-500">
                                                    {order.payments[0]?.status ?? "Unknown"}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}>
                                                    {status.replaceAll("_", " ")}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-zinc-400">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex justify-end gap-2">
                                                    {!shipment ? (
                                                        <button
                                                            onClick={() => void runAction(order, "CREATE_SHIPMENT")}
                                                            disabled={busy === actionKey}
                                                            className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-bold text-black disabled:opacity-50"
                                                        >
                                                            {busy === actionKey ? "Creating…" : "Create shipment"}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => openDetails(order)}
                                                            className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-2 text-xs hover:border-cyan-400 hover:text-cyan-400"
                                                        >
                                                            Manage <ArrowRight size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="border-t border-zinc-800 px-4 py-3 text-xs text-zinc-500 light:border-zinc-200">
                    Showing {filteredOrders.length} of {orders.length} eligible orders
                </div>
            </div>

            {selected?.shipment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl light:border-zinc-200 light:bg-white">
                        <div className="flex items-start justify-between border-b border-zinc-800 p-5 light:border-zinc-200">
                            <div>
                                <p className="text-xs tracking-widest text-cyan-400">FULFILLMENT DETAILS</p>
                                <h2 className="mt-1 text-xl font-bold">{selected.orderCode}</h2>
                                <p className="mt-1 text-sm text-zinc-400">{selected.shipment.trackingCode}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="rounded-lg px-3 py-1 text-zinc-400 hover:bg-zinc-800">✕</button>
                        </div>

                        <div className="space-y-5 p-5">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-xl border border-zinc-800 p-4 light:border-zinc-200">
                                    <p className="text-xs text-zinc-500">RECIPIENT</p>
                                    <p className="mt-2 font-semibold">{selected.orderHistory?.fullName ?? selected.user.name}</p>
                                    <p className="mt-1 text-sm text-zinc-400">{selected.orderHistory?.phone ?? "No phone number"}</p>
                                    <p className="mt-2 text-sm text-zinc-400">
                                        {[
                                            selected.orderHistory?.house,
                                            selected.orderHistory?.street,
                                            selected.orderHistory?.city,
                                            selected.orderHistory?.zipCode,
                                            selected.orderHistory?.country,
                                        ].filter(Boolean).join(", ")}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-zinc-800 p-4 light:border-zinc-200">
                                    <p className="text-xs text-zinc-500">PAYMENT</p>
                                    <p className="mt-2 font-semibold">{selected.payments[0]?.method}</p>
                                    <p className="mt-1 text-sm text-zinc-400">{selected.payments[0]?.status}</p>
                                    <p className="mt-2 text-sm text-zinc-400">
                                        ${selected.payments[0]?.paidAmountInUSD?.toFixed(2) ?? "0.00"}
                                    </p>
                                </div>
                            </div>

                            {newToken && (
                                <div className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-4">
                                    <p className="text-sm font-semibold text-cyan-300">New parcel token</p>
                                    <p className="mt-2 break-all font-mono text-sm">{newToken}</p>
                                    <button
                                        onClick={() => {
                                            void navigator.clipboard.writeText(newToken);
                                            toast.success("Parcel token copied.");
                                        }}
                                        className="mt-3 rounded-lg border border-cyan-500/40 px-3 py-2 text-xs text-cyan-300"
                                    >
                                        Copy token
                                    </button>
                                    <p className="mt-2 text-xs text-zinc-400">
                                        Save this token now. It is not returned again unless rotated.
                                    </p>
                                </div>
                            )}

                            <div>
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="font-semibold">Verify order items</h3>
                                    <span className="text-xs text-zinc-500">
                                        {selected.shipment.itemChecks.filter((item) => item.verified).length} / {selected.shipment.itemChecks.length} verified
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {selected.orderItems.map((item) => {
                                        const check = selected.shipment!.itemChecks.find(
                                            (entry) => entry.orderItemId === item.id,
                                        );
                                        const verified = check?.verified ?? false;

                                        return (
                                            <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 p-3 light:border-zinc-200">
                                                <div className="min-w-0">
                                                    <p className="font-medium">{item.variant.product.name}</p>
                                                    <p className="mt-1 text-xs text-zinc-500">
                                                        {item.variant.size} · {item.variant.color} · Qty {item.quantity}
                                                    </p>
                                                </div>
                                                {verified ? (
                                                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                                                        <CheckCircle2 size={16} /> Verified
                                                    </span>
                                                ) : (
                                                    <button
                                                        disabled={selected.shipment.fulfillmentStatus !== "PACKING" || busy === `${selected.id}-VERIFY_ITEM-${item.id}`}
                                                        onClick={() => void runAction(selected, "VERIFY_ITEM", item.id)}
                                                        className="rounded-lg border border-zinc-700 px-3 py-2 text-xs hover:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        Verify item
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 border-t border-zinc-800 pt-4 light:border-zinc-200">
                                {selected.shipment.fulfillmentStatus === "READY_TO_PACK" && (
                                    <button
                                        disabled={!!busy}
                                        onClick={() => void runAction(selected, "START_PACKING")}
                                        className="rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-bold text-black disabled:opacity-50"
                                    >
                                        Start packing
                                    </button>
                                )}

                                {selected.shipment.fulfillmentStatus === "PACKING" && (
                                    <button
                                        disabled={!!busy || selected.shipment.itemChecks.length === 0 || selected.shipment.itemChecks.some((item) => !item.verified)}
                                        onClick={() => void runAction(selected, "MARK_PACKED")}
                                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-bold text-black disabled:opacity-40"
                                    >
                                        <Check size={16} /> Confirm packed
                                    </button>
                                )}

                                {selected.shipment.fulfillmentStatus === "PACKED" && (
                                    <button
                                        disabled={!!busy}
                                        onClick={() => void runAction(selected, "DISPATCH")}
                                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-bold text-black disabled:opacity-40"
                                    >
                                        <Truck size={16} /> Confirm dispatch
                                    </button>
                                )}

                                <button
                                    onClick={() => {
                                        setSelected(null);
                                        setScanOpen(true);
                                        setLookup(selected.shipment!.trackingCode);
                                        setScanResult(null);
                                    }}
                                    className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm hover:border-cyan-400"
                                >
                                    Find by scan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {scanOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl light:border-zinc-200 light:bg-white">
                        <div className="flex items-start justify-between border-b border-zinc-800 p-5 light:border-zinc-200">
                            <div>
                                <p className="text-xs tracking-widest text-cyan-400">PARCEL LOOKUP</p>
                                <h2 className="mt-1 text-xl font-bold">Scan Parcel</h2>
                                <p className="mt-1 text-sm text-zinc-400">
                                    Enter a parcel token, tracking code, or order code.
                                </p>
                            </div>
                            <button onClick={() => setScanOpen(false)} className="rounded-lg px-3 py-1 text-zinc-400 hover:bg-zinc-800">✕</button>
                        </div>

                        <div className="space-y-4 p-5">
                            <div className="rounded-xl border border-dashed border-zinc-700 p-5 text-center">
                                <ScanLine className="mx-auto text-cyan-400" size={34} />
                                <p className="mt-3 text-sm font-semibold">Camera scanner integration comes next</p>
                                <p className="mt-1 text-xs text-zinc-500">
                                    For now, scan lookup supports manual input.
                                </p>
                            </div>

                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    void scanParcel();
                                }}
                                className="space-y-3"
                            >
                                <label className="block text-xs font-semibold tracking-wider text-zinc-400">
                                    PARCEL TOKEN / TRACKING CODE / ORDER CODE
                                </label>
                                <input
                                    value={lookup}
                                    onChange={(event) => setLookup(event.target.value)}
                                    placeholder="HYP-PRT-XXXXXX or HYP-TRK-XXXXXX"
                                    className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-3 font-mono text-sm outline-none focus:border-cyan-400 light:border-zinc-300 light:bg-white"
                                />
                                <button
                                    type="submit"
                                    disabled={scanLoading}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-3 text-sm font-bold text-black disabled:opacity-50"
                                >
                                    {scanLoading ? <LoaderCircle size={16} className="animate-spin" /> : <Search size={16} />}
                                    Find parcel
                                </button>
                            </form>

                            {scanResult && (
                                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                                    <p className="flex items-center gap-2 font-semibold text-emerald-400">
                                        <CheckCircle2 size={18} /> Parcel found
                                    </p>
                                    <p className="mt-2 text-sm">{scanResult.orderCode}</p>
                                    <p className="mt-1 text-xs text-zinc-400">
                                        {scanResult.shipment?.trackingCode}
                                    </p>
                                    <button
                                        onClick={() => {
                                            setScanOpen(false);
                                            openDetails(scanResult);
                                        }}
                                        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 px-3 py-2 text-xs text-emerald-400"
                                    >
                                        Open fulfillment details <ArrowRight size={14} />
                                    </button>
                                </div>
                            )}

                            <div className="flex items-start gap-2 text-xs text-zinc-500">
                                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                                Scanning only finds a parcel. Packing and dispatch actions are validated separately by the server.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
