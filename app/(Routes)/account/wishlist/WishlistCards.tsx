'use client'
import { wishlistWithProduct } from '@/app/types/Product'
import { Getwishlist } from '@/lib/wishlistAPI'
import { useQuery } from '@tanstack/react-query'
import { Heart, Package } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export const WishlistCards = () => {
    const { data: wishlistItems } = useQuery({
        queryKey: ["wishlist"],
        queryFn: Getwishlist
    });
 

    return (
        <section>
            <div className='flex justify-between items-center mb-3'>
                <h2 className='text-2xl font-bold italic'>SAVED <span className='text-second'>ITEMS</span></h2>
                <h3 className='text-sm text-zinc-500'>{wishlistItems?.length} ITEMS</h3>
            </div>
            {
                wishlistItems?.length > 0 ? (
                    <div>
                        {
                            wishlistItems?.map((item: wishlistWithProduct) => (
                                <div className="card bg-base-100 w-96 shadow-sm">
                                    <figure>
                                        <img
                                            src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                                            alt="Shoes" />
                                    </figure>
                                    <div className="card-body">
                                        <h2 className="card-title">Card Title</h2>
                                        <p>A card component has a figure, a body part, and inside body there are title and actions parts</p>
                                        <div className="card-actions justify-end">
                                            <button className="btn btn-primary">Buy Now</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                )
                    : (
                        <div className='p-4 border border-dashed border-zinc-700 h-52 flex justify-center items-center flex-col gap-4'>
                            <Heart />
                            <p className='text-zinc-400'>Your wishlist is empty. Tap the heart on any product to save it here.</p>
                            <Link href="/products" className='light:text-white text-black group relative flex btn bg-second font-bold shadow-none border-0 rounded-none hover:shadow-[0_0_20px_rgba(163,230,53,0.8)] transition-all duration-300 hover:scale-105'>

                                <span className={` flex items-center gap-2`}>
                                    <Package className="group-hover:translate-x-1 transition-transform duration-300" />
                                    BROWSE CATALOG
                                </span>
                            </Link>
                        </div>
                    )
            }
        </section>
    )
}
