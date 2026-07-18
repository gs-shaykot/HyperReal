'use client'
import { orderDetailsSelect } from '@/lib/prisma/orderSelect'
import { Prisma } from '@prisma/client'
import { CalendarDays, ClockArrowUp, Eye, Heart, Hourglass, OctagonX, Package, PackageCheck, Plus, Truck } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export type OrderType = Prisma.OrderGetPayload<{
    select: typeof orderDetailsSelect
}>

export const AllOrder = ({ orders }: { orders: OrderType[] }) => {

    const OrderStatus = [
        {
            status: "PENDING",
            icon: Hourglass,
            color: "yellow-500"
        },
        {
            status: "PROCESSING",
            icon: ClockArrowUp,
            color: "orange-400"
        },
        {
            status: "SHIPPED",
            icon: Truck,
            color: "blue-500"
        },
        {
            status: "DELIVERED",
            icon: PackageCheck,
            color: "second"
        },
        {
            status: "CANCELLED",
            icon: OctagonX, 
            color: "red-500"
        }
    ]

    return (
        <div>
            {/* Header */}
            <div className='flex justify-between items-center mb-3'>
                <h2 className='text-2xl font-bold italic'>Order<span className='text-second'> History</span></h2>
                <h2 className='text-xs text-zinc-500'>{orders?.length} TRANSMISSIONS</h2>
            </div>
            {
                orders?.length > 0 ?
                    (
                        <div>
                            {
                                orders?.map((order) => (
                                    <div key={order.id} className='flex justify-between items-center p-4 border hover:border-second border-zinc-700 mb-3 transition-all duration-150'>
                                        <div className='flex flex-col space-y-2'>
                                            <div className='flex justify-between items-center gap-2 w-68'>
                                                <h2 className='font-bold '>{order.orderCode}</h2>
                                                <h3 className='flex justify-start gap-1'>
                                                    {
                                                        OrderStatus?.map((stat,idx) => (
                                                            stat.status === order.status && (
                                                                <span key={idx} className={`flex items-center text-xs border border-${stat.color} text-${stat.color} p-1 rounded-full`}>
                                                                    <stat.icon className={`h-4 w-4 text-${stat.color} inline-block mr-1`} />
                                                                    {stat.status}
                                                                </span>
                                                            )
                                                        ))
                                                    }
                                                </h3>
                                            </div>

                                            <div className='flex items-center gap-4 text-zinc-400 text-sm'>
                                                <h3 className='flex justify-between items-center gap-1'>
                                                    <CalendarDays size={16} />
                                                    {order.createdAt.toLocaleDateString("en-US", {
                                                        day: "numeric",
                                                        month: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </h3>
                                                <span className='w-2 h-2 rounded-full border border-second'/>
                                                <h3>{order.orderItems.length} ITEMS</h3>
                                            </div>

                                            <div className='flex items-center gap-2'>
                                                {
                                                    order.orderItems.map((item) => (
                                                        <div key={item.id} className='flex items-center text-sm text-zinc-400 bg-zinc-900 px-2 py-1'>
                                                            <h3>{item.variant.product.name}</h3>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                        <div className='flex justify-between items-center gap-3'>
                                            <div className='flex flex-col justify-center items-center'>
                                                <h3 className='text-zinc-400'>TOTAL</h3>
                                                <h3 className='text-second'>${order.payments[0].totalProductPriceInUSD.toFixed(2)}</h3>
                                            </div>
                                            <button className='btn btn-sm rounded-none bg-transparent hover:bg-white hover:text-zinc-900 border-white'>
                                                <Eye />
                                                VIEW
                                            </button>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    ) :
                    (
                        <div className='p-4 border border-dashed border-zinc-700 h-52 flex justify-center items-center flex-col gap-4'>
                            <span className="border border-second p-2 rounded-full">
                                <Plus />
                            </span>
                            <p className='text-zinc-400'>No orders to display yet. Your order history will appear here once you place a purchase.</p>
                            <Link href="/products" className='light:text-white text-black group relative flex btn bg-second font-bold shadow-none border-0 rounded-none hover:shadow-[0_0_20px_rgba(163,230,53,0.8)] transition-all duration-300 hover:scale-105'>

                                <span className={` flex items-center gap-2`}>
                                    <Package className="group-hover:translate-x-1 transition-transform duration-300" />
                                    BROWSE CATALOG
                                </span>
                            </Link>
                        </div>
                    )
            }
        </div>
    )
}
