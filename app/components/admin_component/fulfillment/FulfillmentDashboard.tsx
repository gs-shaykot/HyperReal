
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FulfillmentTab, FulfillmentStatus, ShipmentStatus, ItemCheck, TrackingEvent, Shipment, OrderItem, Payment, ShippingAddress, Order, FulfillmentStats, FulfillmentResponse, ApiResponse, ScanResult, ModalName, DetailTab, BarcodeDetectorResult, BarcodeDetectorInstance, BarcodeDetectorConstructor } from "./types";
import { EMPTY_STATS, BUTTON, LIME_BUTTON, INPUT } from "./constants";
import { formatDate, formatDateTime, getPayment, getPaymentLabel, getPaymentStatusLabel, getAmount, fulfillmentLabel } from "./fulfillment.utils";
import FulfillmentStatsCards from "./components/FulfillmentStats";
import FulfillmentFilters from "./components/FulfillmentFilters";
import FulfillmentTable from "./components/FulfillmentTable";
import StatusBadge from "./components/StatusBadge";
import { AlertCircle, Barcode, Camera, Check, CheckCircle2, LoaderCircle, Package, PackageCheck, Printer, QrCode, ScanLine, Search, ShieldCheck, Truck, UserRound, X } from "lucide-react";

function Modal({
    title,
    subtitle,
    onClose,
    children,
    width = "max-w-xl",
}: {
    title: string;
    subtitle?: string;
    onClose: () => void;
    children: React.ReactNode;
    width?: string;
}) {
    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") onClose();
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-3 backdrop-blur-[2px] sm:p-6"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                className={`max-h-[94vh] w-full ${width} overflow-y-auto border border-zinc-800 bg-[#090909] shadow-2xl`}
            >
                <header className="sticky top-0 z-10 flex items-start justify-between border-b border-zinc-800 bg-[#090909] px-5 py-4">
                    <div>
                        <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white">
                            <span className="text-second">■</span>
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="mt-1 text-[11px] text-zinc-500">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="text-zinc-500 transition hover:text-second"
                    >
                        <X size={18} />
                    </button>
                </header>

                <div className="p-4 sm:p-5">{children}</div>
            </section>
        </div>
    );
}


/* -------------------------------------------------------------------------- */
/* Dashboard                                                                  */
/* -------------------------------------------------------------------------- */

export default function FulfillmentDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState<FulfillmentStats>(EMPTY_STATS);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<FulfillmentTab>("ALL");
    const [paymentFilter, setPaymentFilter] = useState("ALL");
    const [dateFilter, setDateFilter] = useState("");

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [busyAction, setBusyAction] = useState<string | null>(null);
    const [error, setError] = useState("");

    const [modal, setModal] = useState<ModalName>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [detailTab, setDetailTab] = useState<DetailTab>("items");

    const [scanInput, setScanInput] = useState("");
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [scanError, setScanError] = useState("");
    const [cameraError, setCameraError] = useState("");
    const [cameraActive, setCameraActive] = useState(false);
    const [scanLoading, setScanLoading] = useState(false);

    const [parcelToken, setParcelToken] = useState("");
    const [exceptionNote, setExceptionNote] = useState("");

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scannerActiveRef = useRef(false);
    const scanBusyRef = useRef(false);

    const stopCamera = useCallback(() => {
        scannerActiveRef.current = false;

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setCameraActive(false);
    }, []);

    const closeModal = useCallback(() => {
        stopCamera();
        setModal(null);
        setScanError("");
        setCameraError("");
    }, [stopCamera]);

    /* ---------------------------------------------------------------------- */
    /* Fetch paginated orders and global stats                                */
    /* ---------------------------------------------------------------------- */

    const loadOrders = useCallback(async (refresh = false) => {
        if (refresh) setRefreshing(true);
        else setLoading(true);

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
                    result.message ?? "Could not load fulfillment orders.",
                );
            }

            let data = result.data;

            // Apply payment/date filters to the current result page.
            // Search, fulfillment status and pagination remain server-side.
            if (paymentFilter !== "ALL" || dateFilter) {
                data = {
                    ...data,
                    orders: data.orders.filter((order) => {
                        const payment = getPayment(order);

                        const matchesPayment =
                            paymentFilter === "ALL" ||
                            (paymentFilter === "PAID" &&
                                payment?.status === "SUCCESS") ||
                            (paymentFilter === "COD" &&
                                payment?.method === "COD") ||
                            (paymentFilter === "PENDING" &&
                                payment?.status === "PENDING");

                        const matchesDate =
                            !dateFilter ||
                            formatDate(order.createdAt) === dateFilter;

                        return matchesPayment && matchesDate;
                    }),
                };
            }

            setOrders(data.orders);
            setStats(result.data.stats);
            setTotal(result.data.pagination.total);
            setTotalPages(result.data.pagination.totalPages);

            setSelectedOrder((current) => {
                if (!current) return null;

                const updatedOrder = result.data.orders.find(
                    (order) => order.id === current.id,
                );

                if (!updatedOrder) return current;

                return {
                    ...updatedOrder,
                    shipment: updatedOrder.shipment
                        ? {
                            ...updatedOrder.shipment,
                            events: updatedOrder.shipment.events ?? [],
                            itemChecks: updatedOrder.shipment.itemChecks ?? [],
                        }
                        : null,
                };
            });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not load fulfillment orders.",
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeTab, dateFilter, page, paymentFilter, search]);

    useEffect(() => {
        void loadOrders();
    }, [loadOrders]);

    useEffect(() => {
        return () => {
            scannerActiveRef.current = false;
            streamRef.current?.getTracks().forEach((track) => track.stop());
        };
    }, []);

    function submitSearch(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
    }

    function changeTab(tab: FulfillmentTab) {
        setActiveTab(tab);
        setPage(1);
    }

    /* ---------------------------------------------------------------------- */
    /* API actions                                                            */
    /* ---------------------------------------------------------------------- */

    const postAction = useCallback(async (
        action: string,
        payload: Record<string, string>,
    ) => {
        setBusyAction(action);
        setError("");

        try {
            const response = await fetch("/api/admin/fulfillment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, ...payload }),
            });

            const result = (await response.json()) as ApiResponse<unknown>;

            if (!response.ok || !result.success) {
                throw new Error(result.message ?? "Fulfillment action failed.");
            }

            await loadOrders(true);
            return true;
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Fulfillment action failed.",
            );
            return false;
        } finally {
            setBusyAction(null);
        }
    }, [loadOrders]);

    async function createShipment(order: Order) {
        setBusyAction("CREATE_SHIPMENT");
        setError("");
        setParcelToken("");

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
                parcelToken: string | null;
            }>;

            if (!response.ok || !result.success) {
                throw new Error(result.message ?? "Could not create shipment.");
            }

            setParcelToken(result.data.parcelToken ?? "");
            await loadOrders(true);

            setSelectedOrder((current) =>
                current?.id === order.id
                    ? { ...current, shipment: result.data.shipment }
                    : current,
            );
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Could not create shipment.",
            );
        } finally {
            setBusyAction(null);
        }
    }

    async function generateParcelToken(shipmentId: string) {
        setBusyAction("TOKEN");
        setError("");

        try {
            const response = await fetch("/api/admin/fulfillment/token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shipmentId }),
            });

            const result = (await response.json()) as ApiResponse<{
                shipmentId: string;
                trackingCode: string;
                parcelToken: string;
            }>;

            if (!response.ok || !result.success) {
                throw new Error(result.message ?? "Could not generate token.");
            }

            setParcelToken(result.data.parcelToken);
            await loadOrders(true);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Could not generate token.",
            );
        } finally {
            setBusyAction(null);
        }
    }

    /* ---------------------------------------------------------------------- */
    /* Parcel lookup and real camera scanning                                 */
    /* ---------------------------------------------------------------------- */

    async function lookupParcel(value = scanInput) {
        const lookup = value.trim();

        if (!lookup) {
            setScanError("Enter an order code, tracking code, or parcel token.");
            return;
        }

        setScanLoading(true);
        setScanError("");

        try {
            const isParcelToken = /^HYP-PRT-/i.test(lookup);
            const response = await fetch("/api/admin/fulfillment/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    isParcelToken ? { token: lookup } : { lookup },
                ),
            });

            const result = (await response.json()) as ApiResponse<ScanResult>;

            if (!response.ok || !result.success) {
                throw new Error(result.message ?? "No matching parcel found.");
            }

            setScanResult(result.data);
            setScanInput(lookup);
        } catch (err) {
            setScanResult(null);
            setScanError(
                err instanceof Error ? err.message : "No matching parcel found.",
            );
        } finally {
            setScanLoading(false);
        }
    }

    async function startCamera() {
        setCameraError("");
        setScanError("");

        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraError(
                "Camera access requires HTTPS or localhost. Use the manual lookup below.",
            );
            return;
        }

        if (!window.BarcodeDetector) {
            setCameraError(
                "This browser does not support native QR/barcode scanning. Try the latest Chrome or use manual lookup.",
            );
            return;
        }

        try {
            stopCamera();

            const detector = new window.BarcodeDetector({
                formats: ["qr_code", "code_128", "code_39", "ean_13", "ean_8"],
            });

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    facingMode: { ideal: "environment" },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            });

            streamRef.current = stream;

            if (!videoRef.current) {
                stream.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
                return;
            }

            videoRef.current.srcObject = stream;
            await videoRef.current.play();

            scannerActiveRef.current = true;
            setCameraActive(true);

            const scanFrame = async () => {
                if (!scannerActiveRef.current || !videoRef.current) return;

                try {
                    const video = videoRef.current;

                    if (
                        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
                        !scanBusyRef.current
                    ) {
                        scanBusyRef.current = true;

                        try {
                            const results = await detector.detect(video);
                            const decoded = results.find(
                                (item) => item.rawValue.trim().length > 0,
                            );

                            if (decoded?.rawValue) {
                                const value = decoded.rawValue.trim();

                                stopCamera();
                                setScanInput(value);
                                await lookupParcel(value);
                                return;
                            }
                        } finally {
                            scanBusyRef.current = false;
                        }
                    }
                } catch {
                    // A frame can fail detection while the camera is adjusting.
                }

                if (scannerActiveRef.current) {
                    window.setTimeout(() => void scanFrame(), 180);
                }
            };

            void scanFrame();
        } catch (err) {
            stopCamera();

            const errorName =
                err instanceof Error ? err.name : "";

            if (errorName === "NotAllowedError") {
                setCameraError(
                    "Camera permission was denied. Allow camera access in your browser settings, or use manual lookup.",
                );
            } else if (errorName === "NotFoundError") {
                setCameraError(
                    "No camera was found on this device. Use manual lookup.",
                );
            } else {
                setCameraError(
                    "Could not start the camera. Check browser permissions and try again.",
                );
            }
        }
    }

    function openScanModal() {
        setScanInput("");
        setScanResult(null);
        setScanError("");
        setCameraError("");
        setModal("scan");
    }

    function openDetails(order: Order) {
        const normalizedOrder: Order = {
            ...order,
            shipment: order.shipment
                ? {
                    ...order.shipment,
                    events: order.shipment.events ?? [],
                    itemChecks: order.shipment.itemChecks ?? [],
                }
                : null,
        };

        setSelectedOrder(normalizedOrder);
        setDetailTab("items");
        setParcelToken("");
        setExceptionNote("");
        setModal("details");
    }


    function openLabel(order: Order) {
        setSelectedOrder(order);
        setParcelToken("");
        setModal("label");
    }

    function openScannedOrder() {
        if (!scanResult) return;

        const order =
            orders.find((item) => item.id === scanResult.order.id) ??
            null;

        if (order) {
            setSelectedOrder(order);
            setDetailTab("items");
            setModal("details");
            return;
        }

        setSearchInput(scanResult.order.orderCode);
        setSearch(scanResult.order.orderCode);
        setPage(1);
        setModal(null);
    }

    /* ---------------------------------------------------------------------- */
    /* Print shipping label                                                   */
    /* ---------------------------------------------------------------------- */

    function printLabel() {
        window.print();
    }

    /* ---------------------------------------------------------------------- */
    /* Render                                                                 */
    /* ---------------------------------------------------------------------- */

    const visibleTotal =
        paymentFilter === "ALL" && !dateFilter ? total : orders.length;

    return (
        <>
            <style jsx global>{`
                @media print {
                    @page {
                        size: 100mm 150mm;
                        margin: 0;
                    }

                    body * {
                        visibility: hidden !important;
                    }

                    #fulfillment-print-label,
                    #fulfillment-print-label * {
                        visibility: visible !important;
                    }

                    #fulfillment-print-label {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100mm !important;
                        margin: 0 !important;
                        padding: 5mm !important;
                        background: #ffffff !important;
                        color: #000000 !important;
                        box-sizing: border-box !important;
                    }

                    #fulfillment-print-label > div {
                        width: 100% !important;
                        background: #ffffff !important;
                        color: #000000 !important;
                        border-color: #000000 !important;
                        box-shadow: none !important;
                    }

                    #fulfillment-print-label img {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                }
            `}</style>
            <main className="min-h-screen bg-[#080808] px-4 py-6 text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-450 space-y-6">
                {/* Page heading */}
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-lg font-black uppercase tracking-[0.18em]">
                            Fulfillment
                        </h1>
                        <p className="mt-1 text-xs text-zinc-500">
                            Pack, label &amp; dispatch physical parcels
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openScanModal}
                        className={LIME_BUTTON}
                    >
                        <ScanLine size={16} />
                        Scan Parcel
                    </button>
                </header>

                {/* Errors */}
                {error && (
                    <div className="flex items-start gap-3 border border-red-500/40 bg-red-500/5 p-3 text-xs text-red-300">
                        <AlertCircle size={16} className="shrink-0" />
                        <p className="flex-1">{error}</p>
                        <button
                            type="button"
                            onClick={() => setError("")}
                            aria-label="Dismiss error"
                        >
                            <X size={15} />
                        </button>
                    </div>
                )}

                <FulfillmentStatsCards stats={stats} />

                <FulfillmentFilters stats={stats} total={total} activeTab={activeTab} onTabChange={changeTab} searchInput={searchInput} onSearchInputChange={setSearchInput} onSearch={submitSearch} paymentFilter={paymentFilter} onPaymentFilterChange={(value) => { setPaymentFilter(value); setPage(1); }} dateFilter={dateFilter} onDateFilterChange={(value) => { setDateFilter(value); setPage(1); }} onRefresh={() => void loadOrders(true)} loading={loading} refreshing={refreshing} />

                <FulfillmentTable orders={orders} loading={loading} page={page} totalPages={totalPages} visibleTotal={visibleTotal} onPageChange={setPage} onView={openDetails} onScan={openScanModal} onPrintLabel={openLabel} />
            </div>

            {/* ================================================================= */}
            {/* SCAN PARCEL MODAL                                                */}
            {/* ================================================================= */}

            {modal === "scan" && (
                <Modal
                    title="Scan Parcel"
                    subtitle="Point the camera at the parcel QR or barcode."
                    onClose={closeModal}
                >
                    <div className="space-y-4">
                        <div className="relative flex min-h-62.5 flex-col items-center justify-center overflow-hidden border border-zinc-800 bg-[#101010] p-5">
                            <video
                                ref={videoRef}
                                muted
                                playsInline
                                className={`absolute inset-0 h-full w-full object-cover ${cameraActive ? "block" : "hidden"
                                    }`}
                            />

                            {cameraActive ? (
                                <>
                                    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                                        <div className="relative h-40 w-64 max-w-[85%]">
                                            <span className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-second" />
                                            <span className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-second" />
                                            <span className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-second" />
                                            <span className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-second" />
                                            <span className="absolute left-0 right-0 top-1/2 h-px animate-pulse bg-second/80" />
                                        </div>
                                    </div>

                                    <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 bg-black/70 px-2 py-1 text-[10px] text-second">
                                        <span className="h-2 w-2 animate-pulse rounded-full bg-second" />
                                        CAMERA ACTIVE · SCANNING
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center border border-zinc-700 text-zinc-400">
                                        <Camera size={24} />
                                    </div>

                                    <p className="max-w-xs text-[11px] text-zinc-400">
                                        Point the camera at the parcel QR or
                                        barcode.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => void startCamera()}
                                        className={`${BUTTON} mt-4 border-second text-second`}
                                    >
                                        <ScanLine size={14} />
                                        Start Camera
                                    </button>
                                </div>
                            )}
                        </div>

                        {cameraActive && (
                            <button
                                type="button"
                                onClick={stopCamera}
                                className={BUTTON}
                            >
                                Stop Camera
                            </button>
                        )}

                        {cameraError && (
                            <p className="flex gap-2 border border-orange-500/30 bg-orange-500/5 p-3 text-[10px] text-orange-300">
                                <AlertCircle size={15} className="shrink-0" />
                                {cameraError}
                            </p>
                        )}

                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                void lookupParcel();
                            }}
                            className="flex gap-2"
                        >
                            <div className="relative min-w-0 flex-1">
                                <Barcode
                                    size={14}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                                />
                                <input
                                    value={scanInput}
                                    onChange={(event) =>
                                        setScanInput(event.target.value)
                                    }
                                    placeholder="Enter order / tracking code / QR token"
                                    className={`${INPUT} pl-9`}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={scanLoading}
                                className={LIME_BUTTON}
                            >
                                {scanLoading ? (
                                    <LoaderCircle
                                        size={14}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Search size={14} />
                                )}
                                Lookup
                            </button>
                        </form>

                        <p className="text-[9px] leading-relaxed text-zinc-500">
                            Camera scanning works in supported browsers on
                            HTTPS or localhost. Manual lookup is available
                            regardless of camera support.
                        </p>

                        {scanError && (
                            <p className="border border-red-500/30 bg-red-500/5 p-3 text-[10px] text-red-300">
                                {scanError}
                            </p>
                        )}

                        {scanResult && (
                            <div className="border border-second/40 bg-second/4">
                                <div className="flex items-center gap-2 border-b border-second/20 p-3 text-second">
                                    <CheckCircle2 size={16} />
                                    <span className="text-[11px] font-black uppercase tracking-wide">
                                        Parcel Matched
                                    </span>
                                </div>

                                <div className="space-y-3 p-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-black">
                                                {scanResult.order.orderCode}
                                            </p>
                                            <p className="mt-1 text-[10px] text-zinc-400">
                                                {scanResult.trackingCode ??
                                                    "Shipment not created"}{" "}
                                                {scanResult.shipment
                                                    ? `· ${scanResult.shipment.fulfillmentStatus.replaceAll("_", " ").toLowerCase()}`
                                                    : ""}
                                            </p>
                                        </div>

                                        {scanResult.shipment && (
                                            <StatusBadge
                                                value={
                                                    scanResult.shipment
                                                        .fulfillmentStatus
                                                }
                                            />
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={openScannedOrder}
                                            className={BUTTON}
                                        >
                                            Open Order
                                        </button>

                                        {scanResult.shipment ? (
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    const success =
                                                        await postAction(
                                                            "START_PACKING",
                                                            {
                                                                shipmentId:
                                                                    scanResult
                                                                        .shipment!
                                                                        .id,
                                                            },
                                                        );

                                                    if (success) {
                                                        closeModal();
                                                    }
                                                }}
                                                disabled={
                                                    !scanResult.shipment ||
                                                    scanResult.shipment
                                                        .fulfillmentStatus !==
                                                    "READY_TO_PACK" ||
                                                    busyAction ===
                                                    "START_PACKING"
                                                }
                                                className={LIME_BUTTON}
                                            >
                                                Start Packing
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    const order =
                                                        orders.find(
                                                            (item) =>
                                                                item.id ===
                                                                scanResult.order
                                                                    .id,
                                                        );

                                                    if (!order) {
                                                        setSearch(
                                                            scanResult.order
                                                                .orderCode,
                                                        );
                                                        setSearchInput(
                                                            scanResult.order
                                                                .orderCode,
                                                        );
                                                        setPage(1);
                                                        closeModal();
                                                        return;
                                                    }

                                                    await createShipment(order);
                                                }}
                                                className={LIME_BUTTON}
                                            >
                                                Create Shipment
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {/* ================================================================= */}
            {/* SHIPPING LABEL MODAL                                             */}
            {/* ================================================================= */}

            {modal === "label" && selectedOrder && (
                <Modal
                    title="Shipping Label"
                    subtitle="Parcel label preview"
                    onClose={closeModal}
                    width="max-w-md"
                >
                    <div id="fulfillment-print-label">
                        <div className="border-2 border-zinc-300 bg-[#101010] p-3 text-white">
                            <div className="flex items-start justify-between border-b-2 border-zinc-300 pb-3">
                                <div className="flex gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center border border-zinc-300 text-xs font-black">
                                        HR
                                    </div>
                                    <div>
                                        <p className="text-sm font-black tracking-[0.22em]">
                                            HYPERREAL
                                        </p>
                                        <p className="text-[8px] tracking-wider text-zinc-400">
                                            TECHWEAR DIVISION
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-[8px] text-zinc-400">
                                        SERVICE
                                    </p>
                                    <p className="text-[10px] font-black">
                                        {getPayment(selectedOrder)?.shippingMethod ??
                                            "INTL EXPRESS"}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-[1fr_100px] gap-3 border-b border-zinc-700 py-3">
                                <div>
                                    <p className="text-[8px] text-zinc-400">
                                        SHIP TO
                                    </p>
                                    <p className="mt-1 text-xs font-black uppercase">
                                        {selectedOrder.orderHistory?.fullName ??
                                            selectedOrder.user.name ??
                                            "CUSTOMER"}
                                    </p>
                                    <p className="mt-1 text-[10px]">
                                        {selectedOrder.orderHistory?.street ??
                                            "Address not available"}
                                    </p>
                                    {selectedOrder.orderHistory?.house && (
                                        <p className="text-[10px]">
                                            {selectedOrder.orderHistory.house}
                                        </p>
                                    )}
                                    <p className="text-[10px]">
                                        {selectedOrder.orderHistory?.city ?? ""}
                                        {selectedOrder.orderHistory?.zipCode
                                            ? ` ${selectedOrder.orderHistory.zipCode}`
                                            : ""}
                                    </p>
                                    <p className="text-[10px] font-bold">
                                        {selectedOrder.orderHistory?.country ??
                                            "—"}
                                    </p>
                                    <p className="mt-2 text-[9px] text-zinc-300">
                                        {selectedOrder.orderHistory?.phone ??
                                            selectedOrder.user.phone ??
                                            ""}
                                    </p>
                                </div>

                                <div className="flex flex-col items-center justify-center">
                                    {selectedOrder.shipment ? (
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=2&data=${encodeURIComponent(
                                                parcelToken ||
                                                selectedOrder.shipment.trackingCode,
                                            )}`}
                                            alt="Parcel QR code"
                                            width={88}
                                            height={88}
                                            className="border border-white bg-white p-1"
                                        />
                                    ) : (
                                        <div className="flex h-22 w-22 flex-col items-center justify-center border border-dashed border-zinc-500 text-center">
                                            <QrCode size={24} />
                                            <span className="mt-1 text-[8px]">
                                                NO SHIPMENT
                                            </span>
                                        </div>
                                    )}
                                    <p className="mt-1 text-center text-[8px] text-zinc-400">
                                        SCAN PARCEL
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 border-b border-zinc-700 text-center">
                                <div className="border-r border-zinc-700 p-2">
                                    <p className="text-[8px] text-zinc-400">
                                        ORDER
                                    </p>
                                    <p className="mt-1 text-[10px] font-black">
                                        {selectedOrder.orderCode}
                                    </p>
                                </div>

                                <div className="border-r border-zinc-700 p-2">
                                    <p className="text-[8px] text-zinc-400">
                                        ITEMS
                                    </p>
                                    <p className="mt-1 text-[10px] font-black">
                                        {selectedOrder.orderItems.reduce(
                                            (sum, item) => sum + item.quantity,
                                            0,
                                        )}
                                    </p>
                                </div>

                                <div className="p-2">
                                    <p className="text-[8px] text-zinc-400">
                                        PAYMENT
                                    </p>
                                    <p className="mt-1 text-[10px] font-black">
                                        {getPayment(selectedOrder)?.method ===
                                            "COD"
                                            ? "COD"
                                            : getPayment(selectedOrder)?.status ===
                                                "SUCCESS"
                                                ? "PREPAID"
                                                : "VERIFY"}
                                    </p>
                                </div>
                            </div>

                            <div className="py-3">
                                <div className="flex h-12 items-stretch gap-0.75 overflow-hidden bg-white px-1 py-1">
                                    {Array.from(
                                        {
                                            length: 52,
                                        },
                                        (_, index) => (
                                            <span
                                                key={index}
                                                className="block bg-black"
                                                style={{
                                                    width:
                                                        index % 4 === 0
                                                            ? "4px"
                                                            : index % 3 === 0
                                                                ? "2px"
                                                                : "1px",
                                                    flex: index % 5 === 0
                                                        ? "2"
                                                        : "1",
                                                }}
                                            />
                                        ),
                                    )}
                                </div>

                                <div className="mt-1 flex justify-between gap-2 text-[9px] font-bold">
                                    <span>
                                        {selectedOrder.shipment?.trackingCode ??
                                            "SHIPMENT NOT CREATED"}
                                    </span>
                                    <span>HYPERREAL</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                        <button
                            type="button"
                            onClick={async () => {
                                if (!selectedOrder.shipment) {
                                    await createShipment(selectedOrder);
                                    return;
                                }

                                await generateParcelToken(
                                    selectedOrder.shipment.id,
                                );
                            }}
                            className={`${BUTTON} flex-1`}
                            disabled={busyAction !== null}
                        >
                            {busyAction ? (
                                <LoaderCircle
                                    size={14}
                                    className="animate-spin"
                                />
                            ) : (
                                <ShieldCheck size={14} />
                            )}
                            {selectedOrder.shipment
                                ? "Generate QR Token"
                                : "Create Shipment"}
                        </button>

                        <button
                            type="button"
                            onClick={printLabel}
                            disabled={!selectedOrder.shipment}
                            className={`${LIME_BUTTON} flex-1`}
                        >
                            <Printer size={14} />
                            Print Label
                        </button>
                    </div>

                    {parcelToken && (
                        <div className="mt-3 border border-second/30 p-3">
                            <p className="text-[10px] font-bold text-second">
                                PARCEL TOKEN — COPY NOW
                            </p>
                            <code className="mt-2 block break-all text-xs">
                                {parcelToken}
                            </code>
                            <button
                                type="button"
                                onClick={() =>
                                    void navigator.clipboard.writeText(
                                        parcelToken,
                                    )
                                }
                                className={`${BUTTON} mt-2`}
                            >
                                Copy Token
                            </button>
                        </div>
                    )}
                </Modal>
            )}

            {/* ================================================================= */}
            {/* ORDER DETAILS MODAL                                              */}
            {/* ================================================================= */}

            {modal === "details" && selectedOrder && (
                <Modal
                    title={selectedOrder.orderCode}
                    subtitle={`${selectedOrder.shipment?.trackingCode ?? "NO PARCEL"} · ${selectedOrder.shipment?.trackingCode ? "TRACKING ENABLED" : "SHIPMENT NOT CREATED"}`}
                    onClose={closeModal}
                    width="max-w-3xl"
                >
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            <StatusBadge
                                value={fulfillmentLabel(selectedOrder)}
                            />
                            <StatusBadge
                                value={getPaymentStatusLabel(
                                    getPayment(selectedOrder),
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 border border-zinc-800 sm:grid-cols-2">
                            <div className="border-b border-zinc-800 p-4 sm:border-b-0 sm:border-r">
                                <p className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-widest text-zinc-500">
                                    <UserRound size={13} />
                                    DELIVER TO
                                </p>

                                <p className="text-xs font-black">
                                    {selectedOrder.orderHistory?.fullName ??
                                        selectedOrder.user.name ??
                                        "Unknown customer"}
                                </p>
                                <p className="mt-1 text-[11px] text-zinc-300">
                                    {selectedOrder.orderHistory?.street ?? "—"}
                                </p>
                                <p className="text-[11px] text-zinc-300">
                                    {selectedOrder.orderHistory?.city ?? ""}
                                    {selectedOrder.orderHistory?.zipCode
                                        ? ` ${selectedOrder.orderHistory.zipCode}`
                                        : ""}
                                    {selectedOrder.orderHistory?.country
                                        ? `, ${selectedOrder.orderHistory.country}`
                                        : ""}
                                </p>
                                <p className="mt-2 text-[10px] text-zinc-500">
                                    {selectedOrder.orderHistory?.phone ??
                                        selectedOrder.user.phone ??
                                        selectedOrder.user.email}
                                </p>
                            </div>

                            <div className="p-4">
                                <p className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-widest text-zinc-500">
                                    <Package size={13} />
                                    PAYMENT
                                </p>

                                <p className="text-xs font-black">
                                    {getPaymentLabel(getPayment(selectedOrder))}
                                </p>
                                <p className="mt-1 text-sm font-bold">
                                    Order total {getAmount(selectedOrder)}
                                </p>
                                <p className="mt-1 text-[10px] text-zinc-500">
                                    {getPayment(selectedOrder)?.transactionId ??
                                        "No transaction reference"}
                                </p>
                            </div>
                        </div>

                        {/* Detail tabs */}
                        <div className="grid grid-cols-2 border-b border-zinc-800">
                            <button
                                type="button"
                                onClick={() => setDetailTab("items")}
                                className={`border-b-2 py-3 text-[10px] font-black tracking-widest ${detailTab === "items"
                                    ? "border-second text-second"
                                    : "border-transparent text-zinc-500"
                                    }`}
                            >
                                VERIFY &amp; PACK (
                                {selectedOrder.shipment?.itemChecks.filter(
                                    (item) => item.verified,
                                ).length ?? 0}
                                /
                                {selectedOrder.orderItems.length})
                            </button>

                            <button
                                type="button"
                                onClick={() => setDetailTab("timeline")}
                                className={`border-b-2 py-3 text-[10px] font-black tracking-widest ${detailTab === "timeline"
                                    ? "border-second text-second"
                                    : "border-transparent text-zinc-500"
                                    }`}
                            >
                                TIMELINE (
                                {selectedOrder.shipment?.events?.length ?? 0})
                            </button>
                        </div>

                        {detailTab === "items" ? (
                            <div className="space-y-2">
                                <p className="text-[9px] font-bold tracking-widest text-zinc-500">
                                    ITEM CHECKLIST
                                </p>

                                {selectedOrder.orderItems.map((item) => {
                                    const check =
                                        selectedOrder.shipment?.itemChecks.find(
                                            (entry) =>
                                                entry.orderItemId === item.id,
                                        );

                                    const verified = check?.verified ?? false;
                                    const canVerify =
                                        selectedOrder.shipment
                                            ?.fulfillmentStatus === "PACKING" &&
                                        !verified;

                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-3 border border-zinc-800 bg-[#0d0d0d] p-3"
                                        >
                                            <div
                                                className={`flex h-5 w-5 shrink-0 items-center justify-center border ${verified
                                                    ? "border-second bg-second text-black"
                                                    : "border-zinc-700 text-zinc-600"
                                                    }`}
                                            >
                                                {verified && <Check size={13} />}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="text-[11px] font-bold">
                                                    {item.variant.product.name}
                                                </p>
                                                <p className="mt-1 text-[9px] text-zinc-500">
                                                    Size {item.variant.size ?? "—"}
                                                    {" · "}
                                                    {item.variant.color ?? "—"}
                                                </p>
                                            </div>

                                            <p className="text-xs font-black">
                                                ×{item.quantity}
                                            </p>

                                            {canVerify && (
                                                <button
                                                    type="button"
                                                    disabled={busyAction !== null}
                                                    onClick={async () => {
                                                        const shipmentId =
                                                            selectedOrder.shipment
                                                                ?.id;

                                                        if (!shipmentId) return;

                                                        const success =
                                                            await postAction(
                                                                "VERIFY_ITEM",
                                                                {
                                                                    shipmentId,
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
                                                                                        entry,
                                                                                    ) =>
                                                                                        entry.orderItemId ===
                                                                                            item.id
                                                                                            ? {
                                                                                                ...entry,
                                                                                                verified: true,
                                                                                                verifiedAt:
                                                                                                    new Date().toISOString(),
                                                                                            }
                                                                                            : entry,
                                                                                ),
                                                                        },
                                                                    };
                                                                },
                                                            );
                                                        }
                                                    }}
                                                    className={`${BUTTON} border-second text-second`}
                                                >
                                                    Verify
                                                </button>
                                            )}

                                            {verified && (
                                                <span className="text-[9px] font-bold text-second">
                                                    VERIFIED
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}

                                {!selectedOrder.shipment && (
                                    <p className="border border-zinc-800 p-3 text-[10px] text-zinc-500">
                                        Create a shipment before packing this order.
                                    </p>
                                )}

                                {selectedOrder.shipment?.fulfillmentStatus ===
                                    "READY_TO_PACK" && (
                                        <p className="text-[10px] text-zinc-500">
                                            Start packing to unlock the checklist.
                                        </p>
                                    )}

                                <label className="block pt-2">
                                    <span className="mb-2 block text-[9px] font-bold tracking-widest text-zinc-500">
                                        EXCEPTION NOTES
                                    </span>
                                    <textarea
                                        value={exceptionNote}
                                        onChange={(event) =>
                                            setExceptionNote(event.target.value)
                                        }
                                        rows={2}
                                        placeholder="e.g. Customer requested gift wrap; replaced torn polybag"
                                        className="w-full resize-y border border-zinc-800 bg-[#0d0d0d] p-3 text-[11px] outline-none placeholder:text-zinc-600 focus:border-second"
                                    />
                                </label>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {!(selectedOrder.shipment?.events?.length ?? 0) ? (
                                    <p className="border border-zinc-800 p-4 text-[10px] text-zinc-500">
                                        No tracking events recorded yet.
                                    </p>
                                ) : (
                                    selectedOrder.shipment!.events!.map((event) => (
                                        <div
                                            key={event.id}
                                            className="flex gap-3 border-l border-zinc-700 pl-3"
                                        >
                                            <div className="mt-1 text-second">
                                                <CheckCircle2 size={14} />
                                            </div>

                                            <div className="flex-1">
                                                <p className="text-xs font-bold">{event.title}</p>

                                                {event.description && (
                                                    <p className="mt-1 text-[10px] text-zinc-400">
                                                        {event.description}
                                                    </p>
                                                )}

                                                <p className="mt-1 text-[9px] text-zinc-600">
                                                    {formatDateTime(event.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Action footer */}
                        <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-800 pt-4">
                            <button
                                type="button"
                                onClick={() => openLabel(selectedOrder)}
                                className={BUTTON}
                            >
                                <Printer size={14} />
                                Label
                            </button>

                            {!selectedOrder.shipment && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        void createShipment(selectedOrder)
                                    }
                                    disabled={busyAction !== null}
                                    className={LIME_BUTTON}
                                >
                                    {busyAction === "CREATE_SHIPMENT" ? (
                                        <LoaderCircle
                                            size={14}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Package size={14} />
                                    )}
                                    Create Shipment
                                </button>
                            )}

                            {selectedOrder.shipment?.fulfillmentStatus ===
                                "READY_TO_PACK" && (
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            const shipmentId =
                                                selectedOrder.shipment?.id;

                                            if (!shipmentId) return;

                                            const success = await postAction(
                                                "START_PACKING",
                                                { shipmentId },
                                            );

                                            if (success) {
                                                setSelectedOrder((current) =>
                                                    current?.shipment
                                                        ? {
                                                            ...current,
                                                            shipment: {
                                                                ...current.shipment,
                                                                fulfillmentStatus:
                                                                    "PACKING",
                                                            },
                                                        }
                                                        : current,
                                                );
                                            }
                                        }}
                                        disabled={busyAction !== null}
                                        className={LIME_BUTTON}
                                    >
                                        <Package size={14} />
                                        Start Packing
                                    </button>
                                )}

                            {selectedOrder.shipment?.fulfillmentStatus ===
                                "PACKING" && (
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            const shipment = selectedOrder.shipment;

                                            if (!shipment) return;

                                            const allVerified =
                                                selectedOrder.orderItems.length > 0 &&
                                                selectedOrder.orderItems.every(
                                                    (item) =>
                                                        shipment.itemChecks.some(
                                                            (check) =>
                                                                check.orderItemId ===
                                                                item.id &&
                                                                check.verified,
                                                        ),
                                                );

                                            if (!allVerified) {
                                                setError(
                                                    "Verify every order item before marking the parcel packed.",
                                                );
                                                return;
                                            }

                                            const success = await postAction(
                                                "MARK_PACKED",
                                                { shipmentId: shipment.id },
                                            );

                                            if (success) {
                                                setSelectedOrder((current) =>
                                                    current?.shipment
                                                        ? {
                                                            ...current,
                                                            shipment: {
                                                                ...current.shipment,
                                                                fulfillmentStatus:
                                                                    "PACKED",
                                                            },
                                                        }
                                                        : current,
                                                );
                                            }
                                        }}
                                        disabled={busyAction !== null}
                                        className={LIME_BUTTON}
                                    >
                                        <PackageCheck size={14} />
                                        Mark Packed
                                    </button>
                                )}

                            {selectedOrder.shipment?.fulfillmentStatus ===
                                "PACKED" && (
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            const shipmentId =
                                                selectedOrder.shipment?.id;

                                            if (!shipmentId) return;

                                            const success = await postAction(
                                                "DISPATCH",
                                                { shipmentId },
                                            );

                                            if (success) {
                                                setSelectedOrder((current) =>
                                                    current?.shipment
                                                        ? {
                                                            ...current,
                                                            shipment: {
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
                                        disabled={busyAction !== null}
                                        className={LIME_BUTTON}
                                    >
                                        <Truck size={14} />
                                        Dispatch
                                    </button>
                                )}
                        </div>
                    </div>
                </Modal>
            )}
            </main>
        </>
    );
}
