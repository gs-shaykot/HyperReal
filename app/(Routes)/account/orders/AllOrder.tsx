import { Heart, Package, Plus } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export const AllOrder = () => {
    return (
        <div>
            <div className='flex justify-between items-center mb-3'>
                <h2 className='text-2xl font-bold italic'>Order<span className='text-second'> History</span></h2>
                <div className='flex justify-between items-center gap-3'>
                </div>
            </div>
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
        </div>
    )
}
