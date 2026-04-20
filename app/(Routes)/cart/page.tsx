'use client'
import { CartItemWithProductType } from '@/app/types/cartType';
import { deleteCartItemApi, fetchCartApi } from '@/lib/cartAPIs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import toast from 'react-hot-toast';


const page = () => {
    const { data: session } = useSession();
    const queryClient = useQueryClient();

    const { data: cart = [] } = useQuery({
        queryKey: ["cartItems"],
        queryFn: fetchCartApi,
        enabled: !!session?.user,
    });

    const { mutate: deleteCartItem } = useMutation({
        mutationFn: deleteCartItemApi,
        onSuccess: () => {
            toast.success("Item removed from cart");
            queryClient.invalidateQueries({ queryKey: ["cartItems"] });
            queryClient.invalidateQueries({ queryKey: ["cartCount"] });
        },
        onError: () => {
            toast.error("Failed to remove item from cart");
        }
    });

    const subtotal = cart.reduce(
        (acc: number, item: CartItemWithProductType) => acc + item.quantity * item.variant.product.price,
        0
    );

    const handleDeleteItem = (itemId: string) => {
        if (!itemId) return;

        deleteCartItem(itemId);
    }

    return (
        <div className="max-w-7xl mx-auto px-4 text-white py-10">
            {/* HEADER */}
            <h2 className="text-5xl font-bold italic py-6 tracking-wide">
                CARGO <span className="text-lime-400">HOLD</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* ================= LEFT SIDE ================= */}
                <div className="md:col-span-8 space-y-4">
                    {cart.map((item: CartItemWithProductType) => {
                        const matchedImage = item.variant.product.productImages.find(
                            (img) => img.color === item.variant.color
                        )?.imageUrl;

                        return (
                            <div
                                key={item.id}
                                className="flex justify-between bg-[#1a1a1a] border border-zinc-800 p-4 "
                            >
                                {/* IMAGE */}
                                <div className="w-24 h-24 relative bg-black  overflow-hidden">
                                    <Image
                                        src={matchedImage as string}
                                        alt={item.variant.product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* DETAILS */}
                                <div className="flex-1 px-6">
                                    <h3 className="text-lg font-semibold uppercase">
                                        {item.variant.product.name}
                                    </h3>

                                    <p className="text-sm text-zinc-400">
                                        {item.variant.product.category.name} // {item.variant.size}
                                    </p>

                                    {/* QUANTITY CONTROL */}
                                    <div className="flex items-center mt-3">
                                        <button className="px-2 border border-zinc-600 border-r-0">-</button>
                                        <span className='border border-zinc-600 px-2'>{item.quantity}</span>
                                        <button className="px-2 border border-zinc-600 border-l-0">+</button>
                                    </div>
                                </div>

                                {/* PRICE */}
                                <div className="flex flex-col gap-3 items-center justify-between text-right">
                                    <Trash2
                                        size={24}
                                        className='text-zinc-500 hover:text-red-500 transition-colors cursor-pointer'
                                        onClick={() => handleDeleteItem(item.id!)}
                                    />
                                    <p className="text-lime-400 font-bold text-lg">
                                        ${item.variant.product.price.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ================= RIGHT SIDE ================= */}
                <div className="md:col-span-4">
                    <div className="bg-[#1a1a1a] border border-zinc-800 p-6 ">
                        <h3 className="text-xl font-bold mb-6 uppercase">
                            Manifest Summary
                        </h3>

                        {/* COUPON */}
                        <div className="mb-5">
                            <p className="text-xs text-zinc-500 mb-2">Voucher Protocol</p>
                            <div className="flex">
                                <input
                                    type="text"
                                    placeholder="Enter Code"
                                    className="flex-1 bg-black border border-zinc-700 px-3 py-2 text-sm outline-none"
                                />
                                <button className="bg-lime-400 text-black px-4 text-sm font-semibold">
                                    APPLY
                                </button>
                            </div>
                        </div>

                        {/* SUMMARY */}
                        <div className="text-sm space-y-2 border-t border-zinc-700 pt-4">
                            <div className="flex justify-between text-zinc-400">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between text-zinc-400">
                                <span>Shipping</span>
                                <span>FREE</span>
                            </div>
                        </div>

                        {/* TOTAL */}
                        <div className="flex justify-between mt-5 text-lg font-bold">
                            <span>Total</span>
                            <span className="text-lime-400">
                                ${subtotal.toFixed(2)}
                            </span>
                        </div>

                        {/* BUTTON */}
                        <button className="w-full mt-6 bg-lime-400 text-black py-3 font-bold uppercase tracking-wide hover:opacity-90 transition">
                            Initiate Transfer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default page