import prisma from '@/lib/prisma'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export const Category_Count = async () => {
    // LIMIT 4
    const categories = await prisma.category.findMany({
        select: {
            id: true,
            name: true,
            _count: {
                select: {
                    products: true
                }
            }
        },
        orderBy: {
            id: 'asc'
        },
        take: 4
    }) 
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-10'>
            {/* why the justify-between is not working with h3 & h2  */}
            {categories.map((category, idx) => (
                <Link href={`/products?category=${category.id}`} key={category.id}>
                    <div
                        className="relative group h-48 border-b px-6 py-2 border-r border-[#2a2a2e] overflow-hidden cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-zinc-900 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out z-0" />

                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <h3>
                                {idx + 1}
                                <span className="text-second">//</span>
                                {category._count.products} Items
                            </h3>

                            <h2 className='text-3xl italic font-bold'>{category.name.toUpperCase()}</h2>
                        </div>
                        <ArrowRight className="absolute top-2 right-4 transition-transform duration-300 -rotate-45 group-hover:rotate-0" />
                    </div>
                </Link>
            ))}
        </div>
    )
}
