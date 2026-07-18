'use client'
import { orderDetailsSelect } from '@/lib/prisma/orderSelect'
import { Prisma } from '@prisma/client'
import { Eye, Heart, Package, Plus } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export type OrderType = Prisma.OrderGetPayload<{
    select: typeof orderDetailsSelect
}>

export const AllOrder = ({ orders }: { orders: OrderType[] }) => {
    console.log("Order: ", orders)
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
                                        <div className='flex flex-col'>
                                            <div className='flex justify-between items-center gap-3'>
                                                <h2>{order.orderCode}</h2>
                                                <h3>{order.status}</h3>
                                            </div>
                                            <div className='flex justify-between items-center gap-3'>
                                                <h3>
                                                    {order.createdAt.toLocaleDateString("en-US", {
                                                        day: "numeric",
                                                        month: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </h3>
                                                <h3>{order.orderItems.length} ITEMS</h3>
                                            </div>
                                            <div className='flex justify-between items-center gap-3'>
                                                {
                                                    order.orderItems.map((item) => (
                                                        <div key={item.id} className='flex items-center gap-2'>
                                                            <h3>{item.variant.product.name}</h3>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                        <div className='flex justify-between items-end'>
                                            <div>
                                                <h3>TOAL</h3>
                                                <h3>{order.payments[0].totalProductPriceInUSD.toFixed(2)}</h3>
                                            </div>
                                            <button className='btn'>
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
