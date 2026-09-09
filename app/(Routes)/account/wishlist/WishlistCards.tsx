'use client'
import { WishlistSkeleton } from '@/app/components/skeletons/WishlistSkeleton'
import { useCart } from '@/app/Hooks/useCart'
import { useClearWishlist } from '@/app/Hooks/useClearWishlist'
import { useWishlist } from '@/app/Hooks/useWishlist'
import { wishlistWithProduct } from '@/app/types/Product'
import { Getwishlist } from '@/lib/wishlistAPI'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import { Eye, Heart, Package, Trash2, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export const WishlistCards = () => {
    const { data: session } = useSession();
    const { data: wishlistItems, isLoading } = useQuery({
        queryKey: ["wishlist"],
        queryFn: Getwishlist
    });
    const mutation = useCart();
    const toggleWishlistMutation = useWishlist();
    const clearWishlistMutation = useClearWishlist();

    const handlePrimaryAction = (item: wishlistWithProduct) => {
        const isOutOfStock = item.variant.stock <= 0;

        if (!session?.user) {
            toast.custom(() => (
                <div className='bg-zinc-900! light:bg-white! text-second! text-sm light:text-zinc-900! light:shadow border border-zinc-800 light:border-0 px-4 py-2 rounded shadow flex items-center gap-2'>
                    <X className='text-red-500' />
                    {isOutOfStock ? (
                        <>Please sign in to get notified <br /> when this item is back in stock</>
                    ) : (
                        <>Please sign in to add items <br /> to your cart</>
                    )}
                </div>
            ));
            return;
        }

        if (isOutOfStock) {
            toast.success("We'll notify you when this item is back in stock.");
            return;
        }

        mutation.mutate({ variantId: item.variant.id, quantity: 1 });
    };

    if (isLoading) {
        return <WishlistSkeleton />
    }

    return (
        <section className='w-full'>
            <div className='flex justify-between items-center mb-3'>
                <h2 className='text-2xl font-bold italic light:text-zinc-900 text-white'>SAVED <span className='text-second'>ITEMS</span></h2>
                <div className='flex justify-between items-center gap-3'>
                    <h3 className='text-sm text-zinc-500 light:text-zinc-600'>{wishlistItems?.length} ITEMS</h3>
                    {
                        wishlistItems?.length > 0 && (
                            <button
                                onClick={() => {
                                    if (confirm("Are you sure you want to clear your wishlist?")) {
                                        clearWishlistMutation.mutate();
                                    }
                                }}
                                className='flex justify-between items-center btn btn-sm bg-transparent rounded-none light:hover:bg-zinc-100 hover:bg-zinc-900 light:text-red-600 text-red-500 shadow-none'>
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
                                <div key={idx} className="card rounded-none bg-base-100 w-full md:max-w-96 mb-5 md:mb-0 shadow-sm border hover:border-second border-zinc-700 light:border-zinc-300 light:bg-white transition-all group cursor-pointer">
                                    <figure className="aspect-square overflow-hidden bg-black">
                                        <Image
                                            width={600}
                                            height={600}
                                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                            src={
                                                item?.product?.productImages.find(img => img.color === item.variant.color)?.imageUrl ||
                                                item?.product?.productImages[0]?.imageUrl
                                            }
                                            alt="Shoes" />
                                    </figure>
                                    <div className="card-body p-3.5 bg-[#1a1a1a] light:bg-zinc-50">
                                        <p className="text-sm text-zinc-400 light:text-zinc-500">{item.product.category.name}</p>
                                        <div className="flex justify-between gap-3">
                                            <h3 className="card-title flex-1 light:text-zinc-900 text-white">
                                                {item.product.name}
                                            </h3>

                                            <span className="shrink-0 light:text-zinc-700 text-zinc-300">
                                                Size: {item.variant.size}
                                            </span>
                                        </div>
                                        <p className="text-lg font-bold text-second">${item.product.price?.toFixed(2)}</p>
                                        {
                                            item.variant.stock > 0 ? (
                                                <div className='flex items-center gap-2 my-2 text-xs'>
                                                    <span className='w-2 h-2 rounded-full bg-second' />
                                                    <span className='text-zinc-400'>IN STOCK</span>
                                                    <span className='text-zinc-500'>·</span>
                                                    <span className='text-zinc-400'>{item.variant.stock} UNITS AVAILABLE</span>
                                                </div>
                                            ) : (
                                                <div className='bg-red-500/20 border border-red-500 px-3 py-2 my-2'>
                                                    <div className='flex items-center gap-2 text-red-400 text-sm'>
                                                        <Package size={18} />
                                                        <p className='font-bold'>OUT OF STOCK</p>
                                                    </div>
                                                    <p className='text-zinc-500 text-sm mt-1'>// Restock unscheduled</p>
                                                </div>
                                            )
                                        }
                                        <div className="card-actions justify-between items-center">
                                            <button onClick={() => handlePrimaryAction(item)} className="flex-1 btn rounded-none bg-second shadow-none text-zinc-900 cursor-pointer">
                                                {item.variant.stock > 0 ? 'Add To Cart' : 'Notify Me'}
                                            </button>
                                            <Link href={`/products/${item.product.id}`} className='border border-zinc-700 light:border-zinc-300 p-2 btn rounded-none bg-transparent light:hover:border-zinc-900 hover:border-white light:text-zinc-900 text-white transition-all hover:scale-105'>
                                                <Eye className='group-hover:text-second' />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    toggleWishlistMutation.mutate({ productId: item.product.id as string, isWishlisted: true, variantId: item.variant.id as string });
                                                }} className='border border-zinc-700 light:border-zinc-300 p-2 btn rounded-none bg-second/30 light:bg-zinc-100 group hover:border-white light:hover:border-zinc-900 transition-all hover:scale-105'>
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
                        <div className='p-4 border border-dashed border-zinc-700 light:border-zinc-300 bg-[#0f0f0f] light:bg-white h-52 flex justify-center items-center flex-col gap-4'>
                            <Heart className='light:text-zinc-700 text-zinc-400' />
                            <p className='light:text-zinc-600 text-zinc-400'>Your wishlist is empty. Tap the heart on any product to save it here.</p>
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
