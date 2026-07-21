import { orderDetailsSelect } from '@/lib/prisma/orderSelect';
import { Prisma } from '@prisma/client';
import { CalendarDays, ClockArrowUp, Hourglass, OctagonX, PackageCheck, Truck, X } from 'lucide-react';

export type OrderType = Prisma.OrderGetPayload<{
    select: typeof orderDetailsSelect
}>
type OrderModalProps = {
    open: boolean;
    onCloseAction: () => void;
    order: OrderType | null;
};

export const OrderModal = ({
    open,
    onCloseAction,
    order
}: OrderModalProps) => {

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
    console.log("Order: ", order);
    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-2xl max-h-[90vh] rounded-none border border-zinc-700 bg-main p-0 shadow-xl">

                {/* Header */}
                <div className="border-b-2 border-zinc-800 p-5 sticky top-0 bg-main z-10">
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="text-xl font-bold uppercase tracking-widest">
                            Order Transmission
                        </h2>
                        {currentStatus && StatusIcon && (
                            <span
                                className={`
                                    flex items-center
                                    text-xs
                                    border
                                    ${currentStatus.classname}
                                    p-1
                                    rounded-full
                                    shrink-0
                                `}
                            >
                                <StatusIcon className="h-4 w-4 inline-block mr-1" />

                                {currentStatus.status}
                            </span>
                        )}
                    </div>

                    <div className="w-64 flex items-center gap-2 text-sm text-zinc-300">
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
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="text-sm text-zinc-400">
                            Order Placed
                        </h3>
                        <h3 className="text-xs">
                            {currentStatus?.description}
                        </h3>
                    </div>

                    <div className="w-full h-2 bg-zinc-800 overflow-hidden mb-2">
                        <div
                            className={`
                                h-full
                                transition-all
                                duration-500
                                ${order.status === "CANCELLED"
                                    ? "bg-red-500"
                                    : "bg-second"
                                }
                            `}
                            style={{
                                width: `${currentStatus?.percentage ?? 0}%`
                            }}
                        />
                    </div>
                    <div className="flex justify-between items-center text-zinc-400 text-xs">
                        <h3 className='flex justify-between items-center gap-1'>
                            <Truck size={18} />
                            Tracking: {order?.orderCode}
                        </h3>
                        <h3>Est. Delivery: 11/08/2026</h3>
                    </div>
                </div>

                {/* Product Details */}
                <div className="p-5">
                    <h3 className='text-zinc-200 uppercase mb-3'>Items Manifest</h3>
                    <div>
                        {
                            order.orderItems.map((item) => (
                                <div key={item.id} className='mb-2 bg-[#0f0f0f] border-2 border-zinc-800 p-2 flex justify-between items-start'>
                                    <div className='flex items-start gap-3'>
                                        <img
                                            className="w-24 h-3w-24 object-cover"
                                            src={item.variant.product.productImages.find((img) => img.color === item.variant.color)?.imageUrl || ""} alt="" />
                                        <div className='text-zinc-300 text-sm'>
                                            <h3>{item.variant.product.name}</h3>
                                            <h3>{item.variant.color} / {item.variant.size} / QTY: {item.quantity}</h3>
                                        </div>
                                    </div>
                                    <div className='text-white mt-1'>
                                        <h3 className="text-sm">${(item.priceAtPurchase * item.quantity).toFixed(2)}</h3>
                                        <h3 className="text-zinc-400">${item.priceAtPurchase} each</h3>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>

                {/* COST BREAKDOWN */}
                <div className="p-5 pt-0 bg-[#0f0f0f]">
                    <div className='border-2 border-zinc-800 p-3'>
                        <h3 className='text-zinc-400 text-sm mb-3'>COST BREAKDOWN</h3>
                        <div className='flex justify-between items-center mt-2'>
                            <h3>Subtotal</h3>
                            <h3>${order.payments[0]?.totalProductPriceInUSD.toFixed(2)}</h3>
                        </div>

                        <div className='flex justify-between items-center mt-2 pb-2 border-b border-zinc-600'>
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
