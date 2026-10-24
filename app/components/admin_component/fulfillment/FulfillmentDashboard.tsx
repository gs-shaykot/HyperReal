
"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    Activity,
    AlertCircle,
    ArrowDownRight,
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
    Box,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ClipboardCheck,
    Clock3,
    LoaderCircle,
    Package,
    PackageCheck,
    PackageOpen,
    RefreshCw,
    ScanLine,
    Search,
    ShieldCheck,
    Truck,
    UserRound,
    X,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

type FulfillmentTab =
    | "ALL"
    | "READY_TO_PACK"
    | "PACKING"
    | "PACKED"
    | "DISPATCHED";

type FulfillmentStatus =
    | "READY_TO_PACK"
    | "PACKING"
    | "PACKED"
    | "DISPATCHED";

type ShipmentStatus =
    | "PENDING"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "FAILED";

type PaymentMethod = "STRIPE" | "COD" | "SSLC";
type PaymentStatus = "SUCCESS" | "FAILED" | "PENDING";

type TrackingEvent = {
    id: string;
    type: string;
    title: string;
    description: string | null;
    location?: string | null;
    createdAt: string;
    actor?: {
        id: string;
        name: string | null;
    } | null;
};

type ShipmentItemCheck = {
    id: string;
    shipmentId: string;
    orderItemId: string;
    verified: boolean;
    verifiedAt: string | null;
    verifiedBy: string | null;
};

type Shipment = {
    id: string;
    orderId: string;
    trackingCode: string;
    fulfillmentStatus: FulfillmentStatus;
    status: ShipmentStatus;
    assignedCourier?: {
        id: string;
        name: string | null;
        email: string;
        phone: string | null;
    } | null;
    itemChecks: ShipmentItemCheck[];
    events: TrackingEvent[];
    packedAt?: string | null;
    dispatchedAt?: string | null;
    deliveredAt?: string | null;
    createdAt: string;
};

type OrderItem = {
    id: string;
    quantity: number;
    priceAtPurchase: number | string;
    variant: {
        id: string;
        size: string | null;
        color: string | null;
        product: {
            id: string;
            name: string;
        };
    };
};

type Payment = {
    id: string;
    method: PaymentMethod;
    status: PaymentStatus;
    country: string | null;
    paidAmountInUSD: number | string | null;
    paidAmountInBDT: number | string | null;
    totalProductPriceInUSD: number | string | null;
    shippingCost: number | string | null;
    shippingMethod: string | null;
    transactionId: string | null;
};

type ShippingAddress = {
    fullName: string;
    street: string;
    city: string;
    house: string | null;
    zipCode: string;
    country: string;
    phone: string;
};

type Order = {
    id: string;
    orderCode: string;
    status: string;
    createdAt: string;
    user: {
        id: string;
        name: string | null;
        email: string;
        phone: string | null;
    };
    orderHistory: ShippingAddress | null;
    orderItems: OrderItem[];
    payments: Payment[];
    shipment: Shipment | null;
};

type FulfillmentStats = {
    readyToPack: number;
    packing: number;
    packed: number;
    awaitingDispatch: number;
    outForDelivery: number;
    delivered: number;
    failed: number;
    ordersByStatus: {
        status: string;
        count: number;
    }[];
};

type FulfillmentResponse = {
    orders: Order[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
    stats: FulfillmentStats;
};

type ApiResponse<T> = {
    success: boolean;
    message?: string;
    data: T;
};

type ScanResult = {
    shipment: {
        id: string;
        fulfillmentStatus: FulfillmentStatus;
        status: ShipmentStatus;
    } | null;
    trackingCode: string | null;
    order: {
        id: string;
        orderCode: string;
    };
};

/* -------------------------------------------------------------------------- */
/*                              Helper functions                              */
/* -------------------------------------------------------------------------- */

const tabs: { label: string; value: FulfillmentTab }[] = [
    { label: "All Orders", value: "ALL" },
    { label: "Ready to Pack", value: "READY_TO_PACK" },
    { label: "Packing", value: "PACKING" },
    { label: "Packed", value: "PACKED" },
    { label: "Dispatched", value: "DISPATCHED" },
];

const emptyStats: FulfillmentStats = {
    readyToPack: 0,
    packing: 0,
    packed: 0,
    awaitingDispatch: 0,
    outForDelivery: 0,
    delivered: 0,
    failed: 0,
    ordersByStatus: [],
};

function formatDate(value: string | null | undefined) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function formatMoney(
    value: number | string | null | undefined,
    currency = "USD",
) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    const amount = Number(value);

    if (!Number.isFinite(amount)) return "—";

    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        return `${currency} ${amount.toFixed(2)}`;
    }
}

function getPayment(order: Order) {
    return order.payments?.[0] ?? null;
}

function getOrderAmount(order: Order) {
    const payment = getPayment(order);

    if (!payment) return "—";

    if (payment.country?.toLowerCase() === "bangladesh") {
        return formatMoney(payment.paidAmountInBDT, "BDT");
    }

    return formatMoney(payment.paidAmountInUSD, "USD");
}

function getFulfillmentLabel(order: Order) {
    if (!order.shipment) return "Ready to Pack";

    switch (order.shipment.fulfillmentStatus) {
        case "READY_TO_PACK":
            return "Ready to Pack";
        case "PACKING":
            return "Packing";
        case "PACKED":
            return "Packed";
        case "DISPATCHED":
            return "Dispatched";
        default:
            return order.shipment.fulfillmentStatus;
    }
}

function getFulfillmentClasses(status: string) {
    switch (status) {
        case "READY_TO_PACK":
            return "border-cyan-400/30 bg-cyan-400/10 text-cyan-300";
        case "PACKING":
            return "border-amber-400/30 bg-amber-400/10 text-amber-300";
        case "PACKED":
            return "border-violet-400/30 bg-violet-400/10 text-violet-300";
        case "DISPATCHED":
            return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
        case "OUT_FOR_DELIVERY":
            return "border-blue-400/30 bg-blue-400/10 text-blue-300";
        case "DELIVERED":
            return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
        case "FAILED":
            return "border-red-400/30 bg-red-400/10 text-red-300";
        default:
            return "border-zinc-700 bg-zinc-800 text-zinc-300";
    }
}

function getPaymentClasses(status: string) {
    switch (status) {
        case "SUCCESS":
            return "text-emerald-400";
        case "PENDING":
            return "text-amber-400";
        case "FAILED":
            return "text-red-400";
        default:
            return "text-zinc-400";
    }
}

/* -------------------------------------------------------------------------- */
/*                            Reusable UI components                           */
/* -------------------------------------------------------------------------- */

function StatCard({
    title,
    value,
    description,
    icon: Icon,
    accent,
    onClick,
}: {
    title: string;
    value: number;
    description: string;
    icon: typeof Package;
    accent: string;
    onClick?: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group w-full rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-left transition hover:border-zinc-600 ${
                onClick ? "cursor-pointer" : "cursor-default"
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm text-zinc-400">{title}</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
                        {value}
                    </p>
                </div>

                <span
                    className={`rounded-lg border border-current/20 bg-current/5 p-2 ${accent}`}
                >
                    <Icon size={19} />
                </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-zinc-500">{description}</p>
                {onClick && (
                    <ArrowUpRight
                        size={15}
                        className="text-zinc-500 transition group-hover:text-white"
                    />
                )}
            </div>
        </button>
    );
}

function StatusBadge({
    status,
    children,
}: {
    status: string;
    children?: React.ReactNode;
}) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${getFulfillmentClasses(
                status,
            )}`}
        >
            {children ?? status.replaceAll("_", " ")}
        </span>
    );
}

function Modal({
    title,
    subtitle,
    onClose,
    children,
    wide = false,
}: {
    title: string;
    subtitle?: string;
    onClose: () => void;
    children: React.ReactNode;
    wide?: boolean;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl ${
                    wide ? "max-w-4xl" : "max-w-2xl"
                }`}
            >
                <div className="flex items-start justify-between gap-4 border-b border-zinc-800 px-5 py-4 sm:px-6">
                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="mt-1 text-sm text-zinc-400">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close modal"
                        className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="overflow-y-auto p-5 sm:p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

function PrimaryButton({
    children,
    onClick,
    disabled = false,
    loading = false,
}: {
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled || loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
            {loading ? (
                <LoaderCircle size={16} className="animate-spin" />
            ) : null}
            {children}
        </button>
    );
}

function SecondaryButton({
    children,
    onClick,
    disabled = false,
}: {
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
            {children}
        </button>
    );
}

/* -------------------------------------------------------------------------- */
/*                           Fulfillment dashboard                            */
/* -------------------------------------------------------------------------- */

export default function FulfillmentDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState<FulfillmentStats | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);

    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [activeTab, setActiveTab] = useState<FulfillmentTab>("ALL");

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState("");

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [scanModalOpen, setScanModalOpen] = useState(false);
    const [scanInput, setScanInput] = useState("");
    const [scanLoading, setScanLoading] = useState(false);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [scanError, setScanError] = useState("");
    const [parcelToken, setParcelToken] = useState("");

    const currentStats = stats ?? emptyStats;

    /* ------------------------------ Load orders ----------------------------- */

    const loadOrders = useCallback(async (showRefresh = false) => {
        if (showRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        setError("");

        try {
            const params = new URLSearchParams({
                search,
                filter: activeTab,
                page: String(page),
                pageSize: "10",
            });

            const response = await fetch(
                `/api/admin/fulfillment?${params.toString()}`,
                { cache: "no-store" },
            );

            const result =
                (await response.json()) as ApiResponse<FulfillmentResponse>;

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Failed to load fulfillment orders.",
                );
            }

            setOrders(result.data.orders);
            setStats(result.data.stats);
            setTotalPages(result.data.pagination.totalPages);
            setTotalOrders(result.data.pagination.total);

            // Keep the selected order updated when refreshing the list.
            setSelectedOrder((current) => {
                if (!current) return null;

                return (
                    result.data.orders.find(
                        (order) => order.id === current.id,
                    ) ?? current
                );
            });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong while loading orders.",
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeTab, page, search]);

    useEffect(() => {
        void loadOrders();
    }, [loadOrders]);

    /* ----------------------------- Search & tabs ---------------------------- */

    function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
    }

    function handleTabChange(tab: FulfillmentTab) {
        setActiveTab(tab);
        setPage(1);
    }

    /* ------------------------------ API actions ----------------------------- */

    const performAction = useCallback(
        async (
            action: string,
            payload: Record<string, string>,
        ): Promise<boolean> => {
            setActionLoading(action);
            setError("");

            try {
                const response = await fetch("/api/admin/fulfillment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action, ...payload }),
                });

                const result = (await response.json()) as ApiResponse<unknown>;

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message || "The requested action failed.",
                    );
                }

                await loadOrders(true);
                return true;
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "The requested action failed.",
                );
                return false;
            } finally {
                setActionLoading(null);
            }
        },
        [loadOrders],
    );

    async function createShipment(order: Order) {
        const confirmed = window.confirm(
            `Create a fulfillment shipment for ${order.orderCode}?`,
        );

        if (!confirmed) return;

        setParcelToken("");

        setActionLoading("CREATE_SHIPMENT");

        try {
            const response = await fetch("/api/admin/fulfillment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "CREATE_SHIPMENT",
                    orderId: order.id,
                }),
            });

            const result = (await response.json()) as ApiResponse<{
                shipment: Shipment;
                parcelToken?: string | null;
            }>;

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Failed to create shipment.",
                );
            }

            if (result.data.parcelToken) {
                setParcelToken(result.data.parcelToken);
            }

            await loadOrders(true);

            // Keep the order details open with the newly created shipment.
            setSelectedOrder((current) =>
                current?.id === order.id
                    ? {
                          ...current,
                          shipment: result.data.shipment,
                      }
                    : current,
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create shipment.",
            );
        } finally {
            setActionLoading(null);
        }
    }

    async function rotateToken(shipmentId: string) {
        setActionLoading("ROTATE_TOKEN");
        setError("");
        setParcelToken("");

        try {
            const response = await fetch(
                "/api/admin/fulfillment/token",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ shipmentId }),
                },
            );

            const result = (await response.json()) as ApiResponse<{
                shipmentId: string;
                trackingCode: string;
                parcelToken: string;
            }>;

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Failed to generate a parcel token.",
                );
            }

            setParcelToken(result.data.parcelToken);
            await loadOrders(true);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to generate a parcel token.",
            );
        } finally {
            setActionLoading(null);
        }
    }

    /* ------------------------------- Scan flow ------------------------------ */

    async function handleScanSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const lookup = scanInput.trim();

        if (!lookup) {
            setScanError("Enter a parcel token, tracking code, or order code.");
            return;
        }

        setScanLoading(true);
        setScanError("");
        setScanResult(null);

        try {
            const response = await fetch("/api/admin/fulfillment/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lookup }),
            });

            const result = (await response.json()) as ApiResponse<ScanResult>;

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Could not find this parcel.");
            }

            setScanResult(result.data);

            // The order may exist even if a shipment has not been created.
            if (result.data.order?.id) {
                const existingOrder = orders.find(
                    (order) => order.id === result.data.order.id,
                );

                if (existingOrder) {
                    setSelectedOrder(existingOrder);
                }
            }

            if (!result.data.order) {
                setScanError("No matching order was found.");
            }
        } catch (err) {
            setScanError(
                err instanceof Error
                    ? err.message
                    : "Could not find this parcel.",
            );
        } finally {
            setScanLoading(false);
        }
    }

    function openOrderFromScan() {
        if (!scanResult) return;

        const order = orders.find(
            (item) => item.id === scanResult.order.id,
        );

        if (order) {
            setSelectedOrder(order);
            setScanModalOpen(false);
            return;
        }

        // The order might be on a different page. Search by its order code.
        setSearchInput(scanResult.order.orderCode);
        setSearch(scanResult.order.orderCode);
        setPage(1);
        setScanModalOpen(false);
    }

    /* ---------------------------- Derived values ---------------------------- */

    const selectedPayment = useMemo(
        () => (selectedOrder ? getPayment(selectedOrder) : null),
        [selectedOrder],
    );

    const verifiedItems = useMemo(() => {
        if (!selectedOrder?.shipment) return 0;

        return selectedOrder.shipment.itemChecks.filter(
            (item) => item.verified,
        ).length;
    }, [selectedOrder]);

    const totalItems = selectedOrder?.orderItems.length ?? 0;

    /* --------------------------------- Render ------------------------------- */

    return (
        <main className="min-h-screen bg-black px-4 py-6 text-zinc-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1600px] space-y-6">
                {/* Header */}
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">
                            <Activity size={14} />
                            Operations / Logistics
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            Fulfillment Center
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                            Verify orders, prepare parcels, and manage
                            dispatches from one place.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <SecondaryButton
                            onClick={() => void loadOrders(true)}
                            disabled={loading || refreshing}
                        >
                            <RefreshCw
                                size={15}
                                className={
                                    refreshing ? "animate-spin" : undefined
                                }
                            />
                            Refresh
                        </SecondaryButton>

                        <PrimaryButton
                            onClick={() => {
                                setScanInput("");
                                setScanResult(null);
                                setScanError("");
                                setScanModalOpen(true);
                            }}
                        >
                            <ScanLine size={16} />
                            Scan Parcel
                        </PrimaryButton>
                    </div>
                </header>

                {/* Error banner */}
                {error && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        <AlertCircle
                            size={18}
                            className="mt-0.5 shrink-0 text-red-400"
                        />

                        <div className="min-w-0 flex-1">{error}</div>

                        <button
                            type="button"
                            onClick={() => setError("")}
                            aria-label="Dismiss error"
                            className="text-red-300 hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Statistics */}
                <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Ready to Pack"
                        value={currentStats.readyToPack}
                        description="Orders awaiting preparation"
                        icon={PackageOpen}
                        accent="text-cyan-300"
                        onClick={() => handleTabChange("READY_TO_PACK")}
                    />

                    <StatCard
                        title="Currently Packing"
                        value={currentStats.packing}
                        description="Orders being checked"
                        icon={ClipboardCheck}
                        accent="text-amber-300"
                        onClick={() => handleTabChange("PACKING")}
                    />

                    <StatCard
                        title="Packed"
                        value={currentStats.packed}
                        description="Ready for dispatch"
                        icon={PackageCheck}
                        accent="text-violet-300"
                        onClick={() => handleTabChange("PACKED")}
                    />

                    <StatCard
                        title="Awaiting Dispatch"
                        value={currentStats.awaitingDispatch}
                        description="Packed and awaiting handoff"
                        icon={Truck}
                        accent="text-emerald-300"
                        onClick={() => handleTabChange("DISPATCHED")}
                    />
                </section>

                {/* Delivery stats */}
                <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                        <div>
                            <p className="text-xs text-zinc-500">
                                Out for Delivery
                            </p>
                            <p className="mt-1 text-xl font-semibold text-blue-300">
                                {currentStats.outForDelivery}
                            </p>
                        </div>
                        <ArrowUpRight size={19} className="text-blue-400" />
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                        <div>
                            <p className="text-xs text-zinc-500">
                                Delivered
                            </p>
                            <p className="mt-1 text-xl font-semibold text-emerald-300">
                                {currentStats.delivered}
                            </p>
                        </div>
                        <CheckCircle2
                            size={19}
                            className="text-emerald-400"
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                        <div>
                            <p className="text-xs text-zinc-500">
                                Delivery Exceptions
                            </p>
                            <p className="mt-1 text-xl font-semibold text-red-300">
                                {currentStats.failed}
                            </p>
                        </div>
                        <AlertCircle size={19} className="text-red-400" />
                    </div>
                </section>

                {/* Main table */}
                <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
                    {/* Table header */}
                    <div className="border-b border-zinc-800 p-4 sm:p-5">
                        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                            <div>
                                <h2 className="font-semibold text-white">
                                    Fulfillment Orders
                                </h2>
                                <p className="mt-1 text-sm text-zinc-500">
                                    {totalOrders} eligible orders
                                </p>
                            </div>

                            <form
                                onSubmit={handleSearchSubmit}
                                className="flex w-full gap-2 lg:max-w-md"
                            >
                                <div className="relative min-w-0 flex-1">
                                    <Search
                                        size={16}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                                    />

                                    <input
                                        value={searchInput}
                                        onChange={(event) =>
                                            setSearchInput(event.target.value)
                                        }
                                        placeholder="Order, customer, email, tracking..."
                                        className="h-10 w-full rounded-lg border border-zinc-800 bg-black pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-400/60"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="rounded-lg border border-zinc-700 px-4 text-sm font-medium text-zinc-200 transition hover:border-cyan-400/50 hover:text-cyan-300"
                                >
                                    Search
                                </button>
                            </form>
                        </div>

                        {/* Tabs */}
                        <div className="mt-5 flex gap-1 overflow-x-auto border-b border-zinc-800">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => handleTabChange(tab.value)}
                                    className={`-mb-px whitespace-nowrap border-b-2 px-3 py-3 text-sm transition ${
                                        activeTab === tab.value
                                            ? "border-cyan-400 text-cyan-300"
                                            : "border-transparent text-zinc-500 hover:text-zinc-200"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Loading */}
                    {loading ? (
                        <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-zinc-400">
                            <LoaderCircle
                                size={28}
                                className="animate-spin text-cyan-400"
                            />
                            <p className="text-sm">Loading fulfillment data...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                            <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                                <Package
                                    size={28}
                                    className="text-zinc-500"
                                />
                            </div>

                            <h3 className="mt-4 font-medium text-white">
                                No orders found
                            </h3>

                            <p className="mt-1 max-w-sm text-sm text-zinc-500">
                                Try another search term or fulfillment status.
                            </p>

                            {(search || activeTab !== "ALL") && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch("");
                                        setSearchInput("");
                                        setActiveTab("ALL");
                                        setPage(1);
                                    }}
                                    className="mt-4 text-sm font-medium text-cyan-300 hover:text-cyan-200"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Desktop table */}
                            <div className="hidden overflow-x-auto lg:block">
                                <table className="w-full min-w-[1050px] text-left">
                                    <thead className="border-b border-zinc-800 bg-zinc-900/50">
                                        <tr className="text-xs uppercase tracking-wider text-zinc-500">
                                            <th className="px-5 py-3 font-medium">
                                                Order
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Customer
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Payment
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Fulfillment
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Items
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Created
                                            </th>
                                            <th className="px-5 py-3 text-right font-medium">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-zinc-800/80">
                                        {orders.map((order) => {
                                            const payment = getPayment(order);

                                            return (
                                                <tr
                                                    key={order.id}
                                                    className="transition hover:bg-zinc-900/40"
                                                >
                                                    <td className="px-5 py-4">
                                                        <p className="font-medium text-white">
                                                            {order.orderCode}
                                                        </p>
                                                        <p className="mt-1 text-xs text-zinc-500">
                                                            {getOrderAmount(order)}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="max-w-48 truncate text-sm text-zinc-200">
                                                            {order.user.name ||
                                                                "Unnamed customer"}
                                                        </p>
                                                        <p className="mt-1 max-w-48 truncate text-xs text-zinc-500">
                                                            {order.user.email}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="text-sm text-zinc-200">
                                                            {payment?.method ??
                                                                "—"}
                                                        </p>
                                                        <p
                                                            className={`mt-1 text-xs ${getPaymentClasses(
                                                                payment?.status ??
                                                                    "",
                                                            )}`}
                                                        >
                                                            {payment?.status ??
                                                                "No payment"}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <StatusBadge
                                                            status={
                                                                order.shipment
                                                                    ?.fulfillmentStatus ??
                                                                "READY_TO_PACK"
                                                            }
                                                        >
                                                            {getFulfillmentLabel(
                                                                order,
                                                            )}
                                                        </StatusBadge>

                                                        {order.shipment && (
                                                            <p className="mt-1.5 text-xs text-zinc-500">
                                                                {order.shipment.trackingCode}
                                                            </p>
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-zinc-300">
                                                        {order.orderItems.length}{" "}
                                                        {order.orderItems.length ===
                                                        1
                                                            ? "item"
                                                            : "items"}
                                                    </td>

                                                    <td className="px-5 py-4 text-xs text-zinc-400">
                                                        {formatDate(
                                                            order.createdAt,
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedOrder(
                                                                    order,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:border-cyan-400/50 hover:text-cyan-300"
                                                        >
                                                            Manage
                                                            <ArrowRight
                                                                size={13}
                                                            />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile/tablet cards */}
                            <div className="divide-y divide-zinc-800 lg:hidden">
                                {orders.map((order) => {
                                    const payment = getPayment(order);

                                    return (
                                        <div
                                            key={order.id}
                                            className="space-y-3 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-white">
                                                        {order.orderCode}
                                                    </p>
                                                    <p className="mt-1 truncate text-sm text-zinc-400">
                                                        {order.user.name ||
                                                            order.user.email}
                                                    </p>
                                                </div>

                                                <StatusBadge
                                                    status={
                                                        order.shipment
                                                            ?.fulfillmentStatus ??
                                                        "READY_TO_PACK"
                                                    }
                                                >
                                                    {getFulfillmentLabel(order)}
                                                </StatusBadge>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 rounded-lg border border-zinc-800 bg-black p-3">
                                                <div>
                                                    <p className="text-xs text-zinc-500">
                                                        Payment
                                                    </p>
                                                    <p className="mt-1 text-sm text-zinc-200">
                                                        {payment?.method ?? "—"}
                                                    </p>
                                                    <p
                                                        className={`text-xs ${getPaymentClasses(
                                                            payment?.status ??
                                                                "",
                                                        )}`}
                                                    >
                                                        {payment?.status ??
                                                            "No payment"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-zinc-500">
                                                        Items / Amount
                                                    </p>
                                                    <p className="mt-1 text-sm text-zinc-200">
                                                        {order.orderItems.length}{" "}
                                                        items
                                                    </p>
                                                    <p className="text-xs text-zinc-400">
                                                        {getOrderAmount(order)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-xs text-zinc-500">
                                                    {formatDate(order.createdAt)}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedOrder(order)
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-200 hover:border-cyan-400/50 hover:text-cyan-300"
                                                >
                                                    Manage
                                                    <ArrowRight size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Pagination */}
                    <footer className="flex flex-col justify-between gap-3 border-t border-zinc-800 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
                        <p className="text-xs text-zinc-500">
                            Page {page} of {totalPages} · {totalOrders} orders
                        </p>

                        <div className="flex items-center gap-2">
                            <SecondaryButton
                                onClick={() =>
                                    setPage((current) =>
                                        Math.max(1, current - 1),
                                    )
                                }
                                disabled={page <= 1 || loading}
                            >
                                <ChevronLeft size={15} />
                                Previous
                            </SecondaryButton>

                            <SecondaryButton
                                onClick={() =>
                                    setPage((current) =>
                                        Math.min(totalPages, current + 1),
                                    )
                                }
                                disabled={page >= totalPages || loading}
                            >
                                Next
                                <ChevronRight size={15} />
                            </SecondaryButton>
                        </div>
                    </footer>
                </section>

                {/* Order status breakdown */}
                {currentStats.ordersByStatus.length > 0 && (
                    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <Activity size={17} className="text-cyan-400" />
                            <h2 className="font-semibold text-white">
                                Order Status Overview
                            </h2>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {currentStats.ordersByStatus.map((item) => (
                                <div
                                    key={item.status}
                                    className="rounded-lg border border-zinc-800 bg-black px-3 py-2"
                                >
                                    <p className="text-xs text-zinc-500">
                                        {item.status.replaceAll("_", " ")}
                                    </p>
                                    <p className="mt-1 text-lg font-semibold text-zinc-100">
                                        {item.count}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* Scan parcel modal                                                */}
            {/* ---------------------------------------------------------------- */}

            {scanModalOpen && (
                <Modal
                    title="Scan or Find a Parcel"
                    subtitle="Use a parcel token, tracking code, or order code."
                    onClose={() => setScanModalOpen(false)}
                >
                    <form onSubmit={handleScanSubmit} className="space-y-4">
                        <label
                            htmlFor="parcel-lookup"
                            className="block text-sm font-medium text-zinc-300"
                        >
                            Parcel identifier
                        </label>

                        <div className="relative">
                            <ScanLine
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                            />
                            <input
                                id="parcel-lookup"
                                autoFocus
                                value={scanInput}
                                onChange={(event) =>
                                    setScanInput(event.target.value)
                                }
                                placeholder="HYP-TRK-..., token, or order code"
                                className="h-12 w-full rounded-lg border border-zinc-700 bg-black pl-10 pr-3 text-sm text-white outline-none focus:border-cyan-400/70"
                            />
                        </div>

                        {scanError && (
                            <p className="flex items-start gap-2 text-sm text-red-300">
                                <AlertCircle
                                    size={16}
                                    className="mt-0.5 shrink-0"
                                />
                                {scanError}
                            </p>
                        )}

                        <PrimaryButton
                            onClick={() =>
                                void handleScanSubmit(
                                    new Event("submit") as unknown as React.FormEvent<HTMLFormElement>,
                                )
                            }
                            loading={scanLoading}
                        >
                            <Search size={15} />
                            Find Parcel
                        </PrimaryButton>
                    </form>

                    {scanResult && (
                        <div className="mt-5 space-y-4 rounded-xl border border-zinc-800 bg-black p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs text-zinc-500">
                                        Order
                                    </p>
                                    <p className="mt-1 font-semibold text-white">
                                        {scanResult.order.orderCode}
                                    </p>
                                </div>

                                {scanResult.shipment ? (
                                    <StatusBadge
                                        status={
                                            scanResult.shipment
                                                .fulfillmentStatus
                                        }
                                    />
                                ) : (
                                    <StatusBadge status="READY_TO_PACK">
                                        No shipment yet
                                    </StatusBadge>
                                )}
                            </div>

                            {scanResult.trackingCode && (
                                <div>
                                    <p className="text-xs text-zinc-500">
                                        Tracking code
                                    </p>
                                    <p className="mt-1 break-all font-mono text-sm text-cyan-300">
                                        {scanResult.trackingCode}
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                                <PrimaryButton onClick={openOrderFromScan}>
                                    Open Order
                                    <ArrowRight size={15} />
                                </PrimaryButton>

                                <SecondaryButton
                                    onClick={() => {
                                        setScanResult(null);
                                        setScanError("");
                                        setScanInput("");
                                    }}
                                >
                                    Scan Another
                                </SecondaryButton>
                            </div>
                        </div>
                    )}
                </Modal>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* Order details / packing modal                                    */}
            {/* ---------------------------------------------------------------- */}

            {selectedOrder && (
                <Modal
                    title={`Order ${selectedOrder.orderCode}`}
                    subtitle={`Created ${formatDate(selectedOrder.createdAt)}`}
                    onClose={() => {
                        setSelectedOrder(null);
                        setParcelToken("");
                    }}
                    wide
                >
                    <div className="space-y-6">
                        {/* Shipment status */}
                        <div className="flex flex-col justify-between gap-3 rounded-xl border border-zinc-800 bg-black p-4 sm:flex-row sm:items-center">
                            <div>
                                <p className="text-xs text-zinc-500">
                                    Fulfillment status
                                </p>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <StatusBadge
                                        status={
                                            selectedOrder.shipment
                                                ?.fulfillmentStatus ??
                                            "READY_TO_PACK"
                                        }
                                    >
                                        {getFulfillmentLabel(selectedOrder)}
                                    </StatusBadge>

                                    {selectedOrder.shipment && (
                                        <span className="font-mono text-xs text-cyan-300">
                                            {selectedOrder.shipment.trackingCode}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {!selectedOrder.shipment ? (
                                <PrimaryButton
                                    onClick={() =>
                                        void createShipment(selectedOrder)
                                    }
                                    loading={
                                        actionLoading === "CREATE_SHIPMENT"
                                    }
                                >
                                    <Package size={15} />
                                    Create Shipment
                                </PrimaryButton>
                            ) : (
                                <SecondaryButton
                                    onClick={() =>
                                        void rotateToken(
                                            selectedOrder.shipment!.id,
                                        )
                                    }
                                    disabled={
                                        actionLoading === "ROTATE_TOKEN"
                                    }
                                >
                                    {actionLoading === "ROTATE_TOKEN" ? (
                                        <LoaderCircle
                                            size={15}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <ShieldCheck size={15} />
                                    )}
                                    Generate Parcel Token
                                </SecondaryButton>
                            )}
                        </div>

                        {/* Newly generated token */}
                        {parcelToken && (
                            <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/5 p-4">
                                <p className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
                                    <ShieldCheck size={16} />
                                    Parcel token generated
                                </p>

                                <p className="mt-2 text-xs text-zinc-400">
                                    Copy this token now. The raw token is only
                                    returned when it is generated.
                                </p>

                                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                                    <code className="min-w-0 flex-1 break-all rounded-lg border border-zinc-800 bg-black p-3 font-mono text-sm text-white">
                                        {parcelToken}
                                    </code>

                                    <SecondaryButton
                                        onClick={() => {
                                            void navigator.clipboard.writeText(
                                                parcelToken,
                                            );
                                        }}
                                    >
                                        Copy Token
                                    </SecondaryButton>
                                </div>
                            </div>
                        )}

                        {/* Customer + address */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-zinc-800 p-4">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                                    <UserRound
                                        size={16}
                                        className="text-cyan-400"
                                    />
                                    Customer
                                </h3>

                                <div className="mt-3 space-y-2 text-sm">
                                    <p className="text-zinc-200">
                                        {selectedOrder.user.name ||
                                            "Unnamed customer"}
                                    </p>
                                    <p className="break-all text-zinc-400">
                                        {selectedOrder.user.email}
                                    </p>
                                    <p className="text-zinc-400">
                                        {selectedOrder.user.phone || "No phone"}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-zinc-800 p-4">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                                    <Box
                                        size={16}
                                        className="text-cyan-400"
                                    />
                                    Shipping Address
                                </h3>

                                {selectedOrder.orderHistory ? (
                                    <div className="mt-3 space-y-1 text-sm text-zinc-300">
                                        <p className="font-medium text-white">
                                            {
                                                selectedOrder.orderHistory
                                                    .fullName
                                            }
                                        </p>
                                        <p>
                                            {
                                                selectedOrder.orderHistory
                                                    .street
                                            }
                                        </p>
                                        {selectedOrder.orderHistory.house && (
                                            <p>
                                                {
                                                    selectedOrder.orderHistory
                                                        .house
                                                }
                                            </p>
                                        )}
                                        <p>
                                            {selectedOrder.orderHistory.city},{" "}
                                            {
                                                selectedOrder.orderHistory
                                                    .zipCode
                                            }
                                        </p>
                                        <p>
                                            {
                                                selectedOrder.orderHistory
                                                    .country
                                            }
                                        </p>
                                        <p className="pt-1 text-zinc-400">
                                            {
                                                selectedOrder.orderHistory
                                                    .phone
                                            }
                                        </p>
                                    </div>
                                ) : (
                                    <p className="mt-3 text-sm text-zinc-500">
                                        No shipping address available.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Payment summary */}
                        <div className="rounded-xl border border-zinc-800 p-4">
                            <h3 className="text-sm font-semibold text-white">
                                Payment Summary
                            </h3>

                            {selectedPayment ? (
                                <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    <div>
                                        <p className="text-xs text-zinc-500">
                                            Method
                                        </p>
                                        <p className="mt-1 text-sm text-zinc-200">
                                            {selectedPayment.method}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-zinc-500">
                                            Status
                                        </p>
                                        <p
                                            className={`mt-1 text-sm ${getPaymentClasses(
                                                selectedPayment.status,
                                            )}`}
                                        >
                                            {selectedPayment.status}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-zinc-500">
                                            Amount
                                        </p>
                                        <p className="mt-1 text-sm text-zinc-200">
                                            {getOrderAmount(selectedOrder)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-zinc-500">
                                            Transaction
                                        </p>
                                        <p className="mt-1 break-all text-sm text-zinc-300">
                                            {selectedPayment.transactionId ||
                                                "—"}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-3 text-sm text-zinc-500">
                                    No payment record available.
                                </p>
                            )}
                        </div>

                        {/* Item checklist */}
                        <div className="rounded-xl border border-zinc-800">
                            <div className="flex flex-col justify-between gap-2 border-b border-zinc-800 p-4 sm:flex-row sm:items-center">
                                <div>
                                    <h3 className="font-semibold text-white">
                                        Order Item Checklist
                                    </h3>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        Verify each item against the order
                                        before marking the parcel packed.
                                    </p>
                                </div>

                                {selectedOrder.shipment && (
                                    <span className="text-sm text-zinc-400">
                                        {verifiedItems}/{totalItems} verified
                                    </span>
                                )}
                            </div>

                            <div className="divide-y divide-zinc-800">
                                {selectedOrder.orderItems.map((item) => {
                                    const itemCheck =
                                        selectedOrder.shipment?.itemChecks.find(
                                            (check) =>
                                                check.orderItemId === item.id,
                                        );

                                    const verified =
                                        itemCheck?.verified ?? false;

                                    const canVerify =
                                        selectedOrder.shipment
                                            ?.fulfillmentStatus === "PACKING" &&
                                        !verified;

                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-3 p-4"
                                        >
                                            <div
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                                                    verified
                                                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                                                        : "border-zinc-800 bg-black text-zinc-500"
                                                }`}
                                            >
                                                {verified ? (
                                                    <Check size={17} />
                                                ) : (
                                                    <Package size={17} />
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-zinc-100">
                                                    {item.variant.product.name}
                                                </p>

                                                <p className="mt-1 text-xs text-zinc-500">
                                                    Size:{" "}
                                                    {item.variant.size || "—"}{" "}
                                                    <span className="px-1">
                                                        ·
                                                    </span>
                                                    Color:{" "}
                                                    {item.variant.color || "—"}{" "}
                                                    <span className="px-1">
                                                        ·
                                                    </span>
                                                    Qty: {item.quantity}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                {verified ? (
                                                    <span className="text-xs font-medium text-emerald-300">
                                                        Verified
                                                    </span>
                                                ) : canVerify ? (
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            actionLoading ===
                                                            `VERIFY_ITEM_${item.id}`
                                                        }
                                                        onClick={async () => {
                                                            const success =
                                                                await performAction(
                                                                    "VERIFY_ITEM",
                                                                    {
                                                                        shipmentId:
                                                                            selectedOrder
                                                                                .shipment!
                                                                                .id,
                                                                        orderItemId:
                                                                            item.id,
                                                                    },
                                                                );

                                                            if (success) {
                                                                setSelectedOrder(
                                                                    (current) => {
                                                                        if (
                                                                            !current?.shipment
                                                                        ) {
                                                                            return current;
                                                                        }

                                                                        return {
                                                                            ...current,
                                                                            shipment: {
                                                                                ...current.shipment,
                                                                                itemChecks:
                                                                                    current.shipment.itemChecks.map(
                                                                                        (
                                                                                            check,
                                                                                        ) =>
                                                                                            check.orderItemId ===
                                                                                            item.id
                                                                                                ? {
                                                                                                      ...check,
                                                                                                      verified: true,
                                                                                                      verifiedAt:
                                                                                                          new Date().toISOString(),
                                                                                                  }
                                                                                                : check,
                                                                                    ),
                                                                            },
                                                                        };
                                                                    },
                                                                );
                                                            }
                                                        }}
                                                        className="rounded-lg border border-cyan-400/30 px-3 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-400/10 disabled:opacity-40"
                                                    >
                                                        Verify
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-zinc-600">
                                                        Pending
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Packing actions */}
                            {selectedOrder.shipment && (
                                <div className="flex flex-col gap-3 border-t border-zinc-800 bg-black/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-xs text-zinc-500">
                                        {selectedOrder.shipment.fulfillmentStatus ===
                                        "READY_TO_PACK"
                                            ? "Start packing to enable item verification."
                                            : selectedOrder.shipment
                                                  .fulfillmentStatus ===
                                              "PACKING"
                                            ? "All items must be verified before packing is completed."
                                            : selectedOrder.shipment
                                                  .fulfillmentStatus ===
                                              "PACKED"
                                            ? "The parcel is packed and ready to dispatch."
                                            : "The parcel has been dispatched."}
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        {selectedOrder.shipment
                                            .fulfillmentStatus ===
                                            "READY_TO_PACK" && (
                                            <PrimaryButton
                                                loading={
                                                    actionLoading ===
                                                    "START_PACKING"
                                                }
                                                onClick={async () => {
                                                    const success =
                                                        await performAction(
                                                            "START_PACKING",
                                                            {
                                                                shipmentId:
                                                                    selectedOrder
                                                                        .shipment!
                                                                        .id,
                                                            },
                                                        );

                                                    if (success) {
                                                        setSelectedOrder(
                                                            (current) =>
                                                                current?.shipment
                                                                    ? {
                                                                          ...current,
                                                                          shipment:
                                                                              {
                                                                                  ...current.shipment,
                                                                                  fulfillmentStatus:
                                                                                      "PACKING",
                                                                              },
                                                                      }
                                                                    : current,
                                                        );
                                                    }
                                                }}
                                            >
                                                <ClipboardCheck size={15} />
                                                Start Packing
                                            </PrimaryButton>
                                        )}

                                        {selectedOrder.shipment
                                            .fulfillmentStatus === "PACKING" && (
                                            <PrimaryButton
                                                loading={
                                                    actionLoading ===
                                                    "MARK_PACKED"
                                                }
                                                disabled={
                                                    verifiedItems !==
                                                        totalItems ||
                                                    totalItems === 0
                                                }
                                                onClick={async () => {
                                                    const success =
                                                        await performAction(
                                                            "MARK_PACKED",
                                                            {
                                                                shipmentId:
                                                                    selectedOrder
                                                                        .shipment!
                                                                        .id,
                                                            },
                                                        );

                                                    if (success) {
                                                        setSelectedOrder(
                                                            (current) =>
                                                                current?.shipment
                                                                    ? {
                                                                          ...current,
                                                                          shipment:
                                                                              {
                                                                                  ...current.shipment,
                                                                                  fulfillmentStatus:
                                                                                      "PACKED",
                                                                              },
                                                                      }
                                                                    : current,
                                                        );
                                                    }
                                                }}
                                            >
                                                <PackageCheck size={15} />
                                                Mark as Packed
                                            </PrimaryButton>
                                        )}

                                        {selectedOrder.shipment
                                            .fulfillmentStatus === "PACKED" && (
                                            <PrimaryButton
                                                loading={
                                                    actionLoading ===
                                                    "DISPATCH"
                                                }
                                                onClick={async () => {
                                                    const confirmed =
                                                        window.confirm(
                                                            "Confirm that this parcel is being handed over for dispatch?",
                                                        );

                                                    if (!confirmed) return;

                                                    const success =
                                                        await performAction(
                                                            "DISPATCH",
                                                            {
                                                                shipmentId:
                                                                    selectedOrder
                                                                        .shipment!
                                                                        .id,
                                                            },
                                                        );

                                                    if (success) {
                                                        setSelectedOrder(
                                                            (current) =>
                                                                current?.shipment
                                                                    ? {
                                                                          ...current,
                                                                          status: "SHIPPED",
                                                                          shipment:
                                                                              {
                                                                                  ...current.shipment,
                                                                                  fulfillmentStatus:
                                                                                      "DISPATCHED",
                                                                                  dispatchedAt:
                                                                                      new Date().toISOString(),
                                                                              },
                                                                      }
                                                                    : current,
                                                        );
                                                    }
                                                }}
                                            >
                                                <Truck size={15} />
                                                Dispatch Parcel
                                            </PrimaryButton>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tracking timeline */}
                        {selectedOrder.shipment && (
                            <div className="rounded-xl border border-zinc-800 p-4">
                                <div className="mb-4 flex items-center gap-2">
                                    <Clock3
                                        size={17}
                                        className="text-cyan-400"
                                    />
                                    <h3 className="font-semibold text-white">
                                        Fulfillment Timeline
                                    </h3>
                                </div>

                                {selectedOrder.shipment.events.length === 0 ? (
                                    <p className="text-sm text-zinc-500">
                                        No tracking events recorded yet.
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {selectedOrder.shipment.events.map(
                                            (event, index) => (
                                                <div
                                                    key={event.id}
                                                    className="flex gap-3"
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
                                                            {event.type ===
                                                            "DELIVERED" ? (
                                                                <CheckCircle2
                                                                    size={15}
                                                                />
                                                            ) : event.type ===
                                                              "DISPATCHED" ? (
                                                                <Truck
                                                                    size={15}
                                                                />
                                                            ) : (
                                                                <Activity
                                                                    size={15}
                                                                />
                                                            )}
                                                        </div>

                                                        {index <
                                                            selectedOrder
                                                                .shipment!
                                                                .events.length -
                                                                1 && (
                                                            <div className="mt-1 min-h-6 w-px flex-1 bg-zinc-800" />
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 flex-1 pb-2">
                                                        <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-start">
                                                            <p className="text-sm font-medium text-zinc-100">
                                                                {event.title}
                                                            </p>
                                                            <span className="text-xs text-zinc-500">
                                                                {formatDate(
                                                                    event.createdAt,
                                                                )}
                                                            </span>
                                                        </div>

                                                        {event.description && (
                                                            <p className="mt-1 text-sm text-zinc-400">
                                                                {
                                                                    event.description
                                                                }
                                                            </p>
                                                        )}

                                                        {event.actor?.name && (
                                                            <p className="mt-1 text-xs text-zinc-600">
                                                                By{" "}
                                                                {
                                                                    event.actor
                                                                        .name
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </main>
    );
}
