'use client'
import { orderDetailsSelect } from '@/lib/prisma/orderSelect'
import { Prisma } from '@prisma/client'
import { Heart, Package, Plus } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export type OrderType = Prisma.OrderGetPayload<{
    select: typeof orderDetailsSelect
}>

export const AllOrder = ({ orders }: { orders: OrderType[] }) => {

    return (
        <div>
            {/* Header */}
            <div className='flex justify-between items-center mb-3'>
                <h2 className='text-2xl font-bold italic'>Order<span className='text-second'> History</span></h2>
                <h2 className='text-xs text-zinc-500'>{orders.length} TRANSMISSIONS</h2>
            </div>
            {
                orders.length > 0 ?
                    (
                        <div>
                            {
                                orders.map((order) => (
                                    <div key={order.id} className='p-4 border hover:border-second border-zinc-700 mb-3 transition-all duration-150'>

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
