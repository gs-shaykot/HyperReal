'use client'
import { useCart } from '@/app/Hooks/useCart'
import { useClearWishlist } from '@/app/Hooks/useClearWishlist'
import { useWishlist } from '@/app/Hooks/useWishlist'
import { wishlistWithProduct } from '@/app/types/Product'
import { Getwishlist } from '@/lib/wishlistAPI'
import { useQuery } from '@tanstack/react-query'
import { Eye, Heart, Package, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useMemo } from 'react'

export const WishlistCards = () => {
    const { data: wishlistItems, isLoading } = useQuery({
        queryKey: ["wishlist"],
        queryFn: Getwishlist
    });

    const mutation = useCart();
    const toggleWishlistMutation = useWishlist();
    const clearWishlistMutation = useClearWishlist();

    return (
        <section>
            <div className='flex justify-between items-center mb-3'>
                <h2 className='text-2xl font-bold italic'>SAVED <span className='text-second'>ITEMS</span></h2>
                <div className='flex justify-between items-center gap-3'>
                    <h3 className='text-sm text-zinc-500'>{wishlistItems?.length} ITEMS</h3>
                    {
                        wishlistItems?.length > 0 && (
                            <button
                                onClick={() => clearWishlistMutation.mutate()}
                                className='flex justify-between items-center btn btn-sm bg-transparent rounded-none hover:bg-zinc-900 text-red-500 shadow-none'>
                                <Trash2 size={16} />
                                CLEAR ALL
                            </button>
                        )
                    }
                </div>
            </div>
            {
                wishlistItems?.length > 0 ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {
                            wishlistItems?.map((item: wishlistWithProduct, idx: any) => (
                                <div key={idx} className="card rounded-none bg-base-100 w-full max-w-96 shadow-sm hover:border hover:border-second transition-all group cursor-pointer">
                                    <figure>
                                        <Image
                                            width={600}
                                            height={600}
                                            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                                            src={
                                                item?.product?.productImages.find(img => img.color === item.variant.color)?.imageUrl ||
                                                item?.product?.productImages[0]?.imageUrl
                                            }
                                            alt="Shoes" />
                                    </figure>
                                    <div className="card-body p-3.5 bg-[#1a1a1a]">
                                        <p className="text-sm text-zinc-400">{item.product.category.name}</p>
                                        <div className="flex justify-between gap-3">
                                            <h3 className="card-title flex-1">
                                                {item.product.name}
                                            </h3>

                                            <span className="shrink-0">
                                                Size: {item.variant.size}
                                            </span>
                                        </div>
                                        <p className="text-lg font-bold text-second">${item.product.price?.toFixed(2)}</p>
                                        <div className="card-actions justify-between items-center">
                                            <button onClick={() => { mutation.mutate({ variantId: item.variant.id as string, quantity: 1 }) }} className="flex-1 btn rounded-none bg-second shadow-none text-zinc-900 cursor-pointer">Add To Cart</button>
                                            <Link href={`/products/${item.product.id}`} className='border border-zinc-700 p-2 btn rounded-none bg-transparent group hover:border-white transition-all hover:scale-105'>
                                                <Eye className='group-hover:text-second' />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    toggleWishlistMutation.mutate({ productId: item.product.id as string, isWishlisted: true, variantId: item.variant.id as string });
                                                }} className='border border-zinc-700 p-2 btn rounded-none bg-second/30 group hover:border-white transition-all hover:scale-105'>
                                                <Heart className='text-second' />
                                            </button>
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
