import { orderDetailsSelect } from '@/lib/prisma/orderSelect';
import { Prisma } from '@prisma/client';
import { CalendarDays, ClockArrowUp, Hourglass, OctagonX, PackageCheck, Truck, X, CheckCircle2, MapPin, Package, RefreshCw } from 'lucide-react';
import { useState } from "react";

export type OrderType = Prisma.OrderGetPayload<{
    select: typeof orderDetailsSelect
}>
type OrderModalProps = {
    open: boolean;
    onCloseAction: () => void;
    order: OrderType | null;
    onRefreshAction: () => Promise<void>;
};

export const OrderModal = ({
    open,
    onCloseAction,
    order,
    onRefreshAction
}: OrderModalProps) => {
    const [refreshing, setRefreshing] = useState(false);
    const refreshOrder = async () => {
        setRefreshing(true);
        try { await onRefreshAction(); } finally { setRefreshing(false); }
    };

    if (!open || !order) return null;

    const OrderStatus = [
        {
            status: "PENDING",
            icon: Hourglass,
            classname: "border-yellow-500 text-yellow-500",
            description: "Your order is awaiting payment confirmation.",
            percentage: 10
        },
        {
            status: "PROCESSING",
            icon: ClockArrowUp,
            classname: "border-orange-400 text-orange-400",
            description: "Your order is being prepared for shipment.",
            percentage: 35
        },
        {
            status: "SHIPPED",
            icon: Truck,
            classname: "border-sky-400 text-sky-400",
            description: "Your order is on its way to you.",
            percentage: 70
        },
        {
            status: "DELIVERED",
            icon: PackageCheck,
            classname: "border-second text-second",
            description: "Your order has been successfully delivered.",
            percentage: 100
        },
        {
            status: "CANCELLED",
            icon: OctagonX,
            classname: "border-red-500 text-red-500",
            description: "Your order has been cancelled.",
            percentage: 100
        }
    ];

    const currentStatus = OrderStatus.find(
        (stat) => stat.status === order.status
    );

    const StatusIcon = currentStatus?.icon;

    const shipment = order.shipment;
    const trackingStatus = shipment
        ? {
            PENDING: { label: "AWAITING DISPATCH", description: "Your parcel has not entered courier delivery yet." },
            OUT_FOR_DELIVERY: { label: "OUT FOR DELIVERY", description: "Your parcel is with the courier." },
            DELIVERED: { label: "DELIVERED", description: "Your parcel has been delivered." },
            FAILED: { label: "DELIVERY ATTEMPT FAILED", description: shipment.failureReason || "The courier could not complete delivery." },
        }[shipment.status]
        : null;
    const fulfillmentLabels: Record<string, string> = {
        READY_TO_PACK: "READY TO PACK",
        PACKING: "PACKING",
        PACKED: "PACKED",
        DISPATCHED: "DISPATCHED",
    };
    const formatTrackingDate = (value: Date | string) =>
        new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-2xl max-h-[90vh] rounded-none border border-zinc-700 light:border-zinc-200 bg-main light:bg-white p-0 shadow-xl text-white light:text-zinc-900">

                {/* Header */}
                <div className="border-b-2 border-zinc-800 light:border-zinc-200 p-5 sticky top-0 bg-main light:bg-white z-10">
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="text-xl font-bold uppercase tracking-widest light:text-zinc-900 text-white">
                            Order Transmission
                        </h2>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => void refreshOrder()} disabled={refreshing} title="Refresh order details" aria-label="Refresh order details" className="inline-flex items-center gap-2 border border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-300 transition hover:border-second hover:text-second disabled:opacity-50">
                                <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                                {refreshing ? "Refreshing..." : "Refresh"}
                            </button>
                        {currentStatus && StatusIcon && (
                            <span
                                className={` flex items-center text-xs border ${currentStatus.classname} p-1 rounded-full shrink-0 `}
                            >
                                <StatusIcon className="h-4 w-4 inline-block mr-1" />

                                {currentStatus.status}
                            </span>
                        )}
                        </div>
                    </div>

                    <div className="w-64 flex items-center gap-2 text-sm text-zinc-300 light:text-zinc-700">
                        <h3>
                            {order.orderCode}
                        </h3>
                        <span className="w-2 h-2 border rounded-full border-second" />
                        <h3>
                            {order.createdAt.toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "numeric",
                                day: "numeric",
                            })}
                        </h3>
                    </div>
                </div>

                <div className="p-5 pb-0">
                    <div className="flex justify-between items-center mb-1 gap-3">
                        <h3 className="text-sm text-zinc-400 light:text-zinc-700">
                            Order Placed
                        </h3>
                        <h3 className="text-xs light:text-zinc-700 text-zinc-300">
                            {currentStatus?.description}
                        </h3>
                    </div>

                    <div className="w-full h-2 bg-zinc-800 light:bg-zinc-200 overflow-hidden mb-2">
                        <div
                            className={` h-full transition-all duration-500 ${order.status === "CANCELLED" ? "bg-red-500" : "bg-second" } `}
                            style={{
                                width: `${currentStatus?.percentage ?? 0}%`
                            }}
                        />
                    </div>
                    <div className="mt-3 space-y-3 border-t border-zinc-800 pt-3 light:border-zinc-200">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs text-zinc-400 light:text-zinc-600">
                                <Truck size={17} />
                                <span>Tracking code:</span>
                                <span className="font-bold text-white light:text-zinc-900">
                                    {shipment?.trackingCode ?? "Not generated yet"}
                                </span>
                            </div>
                            {shipment && (
                                <span className="border border-zinc-700 px-2 py-1 text-[10px] font-bold text-second light:border-zinc-300">
                                    {trackingStatus?.label}
                                </span>
                            )}
                        </div>

                        {shipment ? (
                            <>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    <div className="border border-zinc-800 p-3 light:border-zinc-200">
                                        <p className="text-[10px] tracking-widest text-zinc-500">ORDER STATUS</p>
                                        <p className="mt-1 text-sm font-bold">{order.status.replaceAll("_", " ")}</p>
                                    </div>
                                    <div className="border border-zinc-800 p-3 light:border-zinc-200">
                                        <p className="text-[10px] tracking-widest text-zinc-500">FULFILLMENT STATUS</p>
                                        <p className="mt-1 text-sm font-bold">
                                            {fulfillmentLabels[shipment.fulfillmentStatus] ?? shipment.fulfillmentStatus}
                                        </p>
                                        <p className="mt-1 text-xs text-zinc-500">{trackingStatus?.description}</p>
                                    </div>
                                </div>
                                {shipment.shippingType === "INTERNATIONAL" && (
                                    <div className="border border-sky-500/30 bg-sky-500/5 p-3">
                                        <h4 className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-sky-300">
                                            <Truck size={14} /> International Carrier Tracking
                                        </h4>
                                        <div className="mb-3 border border-sky-500/30 px-3 py-2">
                                            <p className="text-[9px] uppercase tracking-wider text-zinc-500">International delivery progress</p>
                                            <p className={"mt-1 text-xs font-black uppercase " + (shipment.internationalStatus === "DELIVERED" ? "text-lime-400" : shipment.internationalStatus === "EXCEPTION" || shipment.internationalStatus === "RETURNING" ? "text-red-400" : "text-sky-300")}>
                                                {(shipment.internationalStatus || "PREPARING").replaceAll("_", " ")}
                                            </p>
                                        </div>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div>
                                                <p className="text-[9px] uppercase tracking-wider text-zinc-500">Carrier</p>
                                                <p className="mt-1 text-xs font-bold">{shipment.carrierName || "Carrier not assigned yet"}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] uppercase tracking-wider text-zinc-500">Carrier tracking reference</p>
                                                <p className="mt-1 break-all font-mono text-xs font-bold">{shipment.carrierTrackingNumber || "Tracking reference pending"}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] uppercase tracking-wider text-zinc-500">Customs status</p>
                                                <p className={`mt-1 text-xs font-bold ${shipment.customsStatus === "ON_HOLD" ? "text-red-400" : shipment.customsStatus === "CLEARED" ? "text-lime-400" : "text-sky-300"}`}>
                                                    {(shipment.customsStatus || "NOT_REQUIRED").replaceAll("_", " ")}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] uppercase tracking-wider text-zinc-500">Estimated delivery</p>
                                                <p className="mt-1 text-xs font-bold">
                                                    {shipment.estimatedDeliveryAt ? formatTrackingDate(shipment.estimatedDeliveryAt) : "Not available yet"}
                                                </p>
                                            </div>
                                        </div>
                                        {shipment.internationalNotes && (
                                            <p className="mt-3 border-t border-sky-500/20 pt-3 text-xs text-zinc-400">{shipment.internationalNotes}</p>
                                        )}
                                    </div>
                                )}
                                <div className="flex flex-wrap justify-between gap-2 text-xs text-zinc-500">
                                    <span>
                                        {shipment.dispatchedAt
                                            ? `Dispatched: ${formatTrackingDate(shipment.dispatchedAt)}`
                                            : "Dispatch date: pending"}
                                    </span>
                                    <span>
                                        {shipment.deliveredAt
                                            ? `Delivered: ${formatTrackingDate(shipment.deliveredAt)}`
                                            : "Delivery estimate: not available"}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <p className="border border-zinc-800 p-3 text-xs text-zinc-500 light:border-zinc-200">
                                Shipment tracking will appear here once your order has a shipment.
                            </p>
                        )}
                    </div>
                </div>

                {/* TRACKING HISTORY */}
                {shipment && (
                    <div className="px-5 pb-2">
                        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                            <MapPin size={16} className="text-second" />
                            Tracking History
                        </h3>
                        {shipment.events.length > 0 ? (
                            <div className="space-y-0">
                                {shipment.events.map((event, index) => (
                                    <div key={event.id} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <span className="mt-1 flex size-6 shrink-0 items-center justify-center border border-zinc-700 text-second">
                                                {index === 0 ? <CheckCircle2 size={13} /> : <Package size={13} />}
                                            </span>
                                            {index < shipment.events.length - 1 && (
                                                <span className="my-1 min-h-6 w-px flex-1 bg-zinc-700" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1 pb-4">
                                            <p className="text-xs font-bold">{event.title}</p>
                                            {event.description && (
                                                <p className="mt-1 text-xs text-zinc-400 light:text-zinc-600">{event.description}</p>
                                            )}
                                            {event.location && <p className="mt-1 text-xs text-zinc-500">{event.location}</p>}
                                            <p className="mt-1 text-[10px] text-zinc-500">{formatTrackingDate(event.createdAt)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="border border-zinc-800 p-3 text-xs text-zinc-500 light:border-zinc-200">
                                No tracking events recorded yet.
                            </p>
                        )}
                    </div>
                )}

                {/* Product Details */}
                <div className="p-5">
                    <h3 className='text-zinc-200 light:text-zinc-800 uppercase mb-3'>Items Manifest</h3>
                    <div>
                        {
                            order.orderItems.map((item) => (
                                <div key={item.id} className='mb-2 bg-dark light:bg-zinc-50 border-2 border-zinc-800 light:border-zinc-200 p-2 flex justify-between items-start rounded-sm'>
                                    <div className='flex items-start gap-3'>
                                        <img
                                            className="w-24 h-24 object-cover"
                                            src={item.variant.product.productImages.find((img) => img.color === item.variant.color)?.imageUrl || ""} alt="" />
                                        <div className='text-zinc-300 light:text-zinc-700 text-sm'>
                                            <h3 className="light:text-zinc-900">{item.variant.product.name}</h3>
                                            <h3>{item.variant.color} / {item.variant.size} / QTY: {item.quantity}</h3>
                                        </div>
                                    </div>
                                    <div className='text-white light:text-zinc-900 mt-1'>
                                        <h3 className="text-sm">${(item.priceAtPurchase * item.quantity).toFixed(2)}</h3>
                                        <h3 className="text-zinc-400 light:text-zinc-600">${item.priceAtPurchase} each</h3>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>

                {/* COST BREAKDOWN */}
                <div className="p-5 pt-0 bg-dark light:bg-zinc-50">
                    <div className='border-2 border-zinc-800 light:border-zinc-200 p-3'>
                        <h3 className='text-zinc-400 light:text-zinc-700 text-sm mb-3'>COST BREAKDOWN</h3>
                        <div className='flex justify-between items-center mt-2'>
                            <h3>Subtotal</h3>
                            <h3>${order.payments[0]?.totalProductPriceInUSD.toFixed(2)}</h3>
                        </div>

                        <div className='flex justify-between items-center mt-2 pb-2 border-b border-zinc-600 light:border-zinc-300'>
                            <h3>Shipping</h3>
                            <h3>${order.payments[0]?.shippingCost.toFixed(2)}</h3>
                        </div>

                        <div className='flex justify-between items-center mt-2'>
                            <h3>TOTAL</h3>
                            <h3 className='text-second'>${(order.payments[0]?.totalProductPriceInUSD + order.payments[0]?.shippingCost).toFixed(2)}</h3>
                        </div>
                    </div>
                </div>
            </div>


            <form
                method="dialog"
                className="modal-backdrop"
            >
                <button onClick={onCloseAction}>
                    close
                </button>
            </form>

        </dialog>
    );
};
