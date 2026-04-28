'use client'
import { CartItemWithProductType } from '@/app/types/cartType';
import { couponType } from '@/app/types/couponType';
import { deleteCartItemApi, fetchCartApi, updateCartItemApi } from '@/lib/cartAPIs'
import { getBestCoupon, getDiscount, getNextBestCoupon } from '@/lib/Discount_Calculation_funcs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronRight, Sparkles, Trash2, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import localFont from "next/font/local";

type CouponProps = {
  coupons: couponType[]
}

const countries = ['Bangladesh', 'USA', 'Germany', 'Canada', 'UK', 'Australia', 'Japan', 'Singapore'];

const hudson = localFont({
  src: "../../../fonts/Hudson NY Press.woff",
  display: "swap",
})

export const CartSections = ({ coupons }: CouponProps) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const isNewUser = session?.user.isNewUser ?? false;

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<couponType | null>(null);
  const [deliverCountry, setDeliverCountry] = useState('Bangladesh');

  const { data: cart = [] } = useQuery({
    queryKey: ["cartItems"],
    queryFn: fetchCartApi,
    enabled: !!session?.user,
  });

  /*====================DELETE ITEM QUERY=================== */

  const { mutate: deleteCartItem } = useMutation({
    mutationFn: deleteCartItemApi,
    onMutate: async (itemId: string) => {
      await queryClient.cancelQueries({ queryKey: ["cartItems"] });

      const previousCartItem = queryClient.getQueryData(["cartItems"]);

      queryClient.setQueryData(["cartItems"], (old: CartItemWithProductType[] = []) => {
        const safeOld = Array.isArray(old) ? old : [];
        return safeOld.filter((item) => item.id !== itemId);
      });
      return { previousCartItem };
    },
    onSuccess: () => {
      toast.success("Item removed from cargo hold.");
    },
    onError: (_err, _itemId, context) => {
      if (context?.previousCartItem) {
        queryClient.setQueryData(["cartItems"], context.previousCartItem);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cartItems"] });
      queryClient.invalidateQueries({ queryKey: ["cartCount"] })
    }
  });

  /*====================UPDATE ITEM QUERY=================== */

  type MiniCartType = {
    itemId: string;
    quantity: number;
  }

  const { mutate: updateCartItem } = useMutation({
    mutationFn: updateCartItemApi,
    onMutate: async ({ itemId, quantity }: MiniCartType) => {
      await queryClient.cancelQueries({ queryKey: ["cartItems"] });
      const previousCartItem = queryClient.getQueryData(["cartItems"]);
      queryClient.setQueryData(["cartItems"], (old: CartItemWithProductType[] = []) => {
        const safeOld = Array.isArray(old) ? old : [];
        return safeOld.map((item) => item.id === itemId ? { ...item, quantity } : item);
      });

      return { previousCartItem };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousCartItem) {
        queryClient.setQueryData(["cartItems"], context.previousCartItem);
      }
      toast.error("Failed to update item quantity.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cartItems"] });
      queryClient.invalidateQueries({ queryKey: ["cartCount"] });
    }
  })

  const subtotal = useMemo(() => {
    return cart.reduce(
      (acc: number, item: CartItemWithProductType) => acc + item.quantity * item.variant.product.price, 0
    )
  }, [cart]);

  const shippingCost = deliverCountry === 'Bangladesh' ? 1.5 : 40;

  const bestCoupon = useMemo(() => {
    return getBestCoupon(coupons, subtotal, isNewUser);
  }, [coupons, subtotal, isNewUser]);

  console.log("Best Coupon right now", bestCoupon);

  const nextBestCoupon = useMemo(() => {
    return getNextBestCoupon(coupons, subtotal);
  }, [subtotal, coupons]);

  console.log("Best Coupon next", nextBestCoupon);


  const discount = appliedCoupon ? getDiscount(appliedCoupon, subtotal) : 0;

  console.log("discount", discount);

  const total = subtotal + shippingCost - discount;



  /*====================HANDLE FUNCs=================== */

  const handleDeleteItem = (itemId: string) => {
    if (!itemId) return;
    deleteCartItem(itemId);
  }

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (!itemId || newQuantity < 1) return;
    updateCartItem({ itemId, quantity: newQuantity });
  }

  const handleLoadBestCoupon = () => {
    if (!bestCoupon) return;

    setCouponInput(bestCoupon.code);
    setAppliedCoupon(null);
  }

  const handleClearCouponInput = () => {
    setCouponInput('');
    setAppliedCoupon(null);
  }

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    const foundCoupon = coupons.find(c => c.code.toUpperCase() === code);
    if (!foundCoupon) {
      toast.error('Invalid coupon code.');
      return;
    }

    if (foundCoupon.newUserOnly && !isNewUser) {
      toast.error('This coupon is for new users only.');
      return;
    }

    if (subtotal < foundCoupon.minSpend) {
      toast.error(`Minimum spend $${foundCoupon.minSpend}`);
      return;
    }

    setAppliedCoupon(foundCoupon);
    toast.success(`${foundCoupon.code} applied successfully.`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 text-white pb-20">
      {/* HEADER */}
      <h2 className={`${hudson.className} text-5xl font-bold italic py-6 tracking-wide`}>
        CARGO <span className="text-lime-400">HOLD</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* ================= LEFT PANEL ================= */}
        <div className="md:col-span-7 space-y-4">
          {cart.map((item: CartItemWithProductType) => {
            const matchedImage = item.variant.product.productImages.find(
              (img) => img.color === item.variant.color
            )?.imageUrl;

            return (
              <div
                key={item.id}
                className="relative flex justify-between bg-[#1a1a1a] border border-zinc-800 p-4 overflow-hidden"
              >
                {/* CORNER */}
                <span className="absolute top-0 left-0 w-16 h-16 pointer-events-none">
                  <span className='absolute top-0 right-7 w-5 h-px bg-second' />
                  <span className='absolute bottom-7 left-0 w-px h-5 bg-second' />
                  <span className='absolute top-4 left-0 w-5.75 h-px bg-second drop-shadow-[0_0_5px_#ccff00] transform -rotate-45 origin-left' />
                </span>

                {/* IMAGE */}
                <div className="w-24 h-24 relative bg-black overflow-hidden border border-zinc-900">
                  <span className='absolute top-1 left-1 w-3 h-3 z-10 border-l border-t border-second'></span>
                  <span className='absolute top-1 right-1 w-3 h-3 z-10 border-r border-t border-second'></span>
                  <span className='absolute bottom-1 left-1 w-3 h-3 z-10 border-l border-b border-second'></span>
                  <span className='absolute bottom-1 right-1 w-3 h-3 z-10 border-r border-b border-second'></span>
                  <Image
                    src={matchedImage as string}
                    alt={item.variant.product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* DETAILS */}
                <div className="flex-1 px-6">
                  <h3 className="text-lg font-semibold uppercase tracking-wide text-white">
                    {item.variant.product.name}
                  </h3>

                  <p className="text-sm text-zinc-400 mt-1">
                    {item.variant.product.category.name} // {item.variant.size}
                  </p>

                  {/* QUANTITY CONTROL */}
                  <div className="flex items-center mt-3">
                    <button
                      className="px-3 py-1 border border-zinc-600 border-r-0 text-zinc-300 hover:text-white cursor-pointer"
                      onClick={() => handleUpdateQuantity(item.id!, item.quantity - 1)}
                    >
                      -
                    </button>

                    <span className="border border-zinc-600 px-4 py-1 text-white">
                      {item.quantity}
                    </span>

                    <button
                      className="px-3 py-1 border border-zinc-600 border-l-0 text-zinc-300 hover:text-white cursor-pointer"
                      onClick={() => handleUpdateQuantity(item.id!, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* PRICE */}
                <div className="flex flex-col gap-3 items-center justify-between text-right">
                  <Trash2
                    size={22}
                    className="text-zinc-500 hover:text-red-500 transition-colors cursor-pointer"
                    onClick={() => handleDeleteItem(item.id!)}
                  />

                  <p className="text-lime-400 font-bold text-xl">
                    ${(item.variant.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="md:col-span-5">
          <div className="bg-[#1a1a1a] relative border border-zinc-800 p-4 ">

            {/* CORNER */}
            <span className="absolute top-0 left-0 w-16 h-16 pointer-events-none">
              <span className='absolute top-0 right-7 w-5 h-px bg-zinc-600' />
              <span className='absolute bottom-7 left-0 w-px h-5 bg-zinc-600' />
              <span className='absolute top-4 left-0 w-5.75 h-px bg-zinc-600 transform -rotate-45 origin-left' />
            </span>

            <h3 className={` ${hudson.className} text-3xl mb-6 uppercase`}>
              Manifest Summary
            </h3>

            {
              bestCoupon && !appliedCoupon && (
                <div className="cornerStyle w-full bg-second/5 border-2 border-second/40 p-3 my-5 flex items-center justify-between gap-4">

                  <div className="relative w-18 h-18 flex items-center justify-center group">
                    {/* soft ambient glow */}
                    <div className="absolute inset-0 rounded-full bg-second/10 blur-lg animate-pulse" />

                    {/* SVG OCTAGON */}
                    <svg
                      viewBox="0 0 100 100"
                      className="absolute inset-0 w-full h-full"
                      fill="none"
                    >
                      {/* glowing border */}
                      <polygon
                        points="30,2 70,2 98,30 98,70 70,98 30,98 2,70 2,30"
                        className="octagon-border"
                      />

                      {/* subtle inner line */}
                      <polygon
                        points="34,10 66,10 90,34 90,66 66,90 34,90 10,66 10,34"
                        stroke="rgba(132,204,22,.25)"
                        strokeWidth="3"
                      />
                    </svg>

                    {/* inner glow behind icon */}
                    <div className="absolute w-10 h-10 bg-lime-300/10 blur-md rounded-full animate-pulse" />

                    {/* centered sparkle */}
                    <Sparkles
                      size={30}
                      className="relative z-10 text-lime-300 sparkle-icon"
                      strokeWidth={2.2}
                    />
                  </div>

                  <div className='flex-1'>
                    <h2 className='text-base font-medium text-second'>BEST OFFER FOR YOU</h2>
                    <p className='text-xs'>Apply "{bestCoupon?.code.toUpperCase()}" and get ${bestCoupon?.value} off</p>
                  </div>

                  <button className='btn border-second bg-main text-second' onClick={handleLoadBestCoupon}>
                    Apply <ChevronRight className=' ' />
                  </button>

                </div>
              )
            }

            {/* COUPON */}
            <div className="mb-5">
              <p className="text-xs text-zinc-500 mb-2">Voucher Protocol</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Enter Code"
                    value={couponInput}
                    onChange={(event) => setCouponInput(event.target.value)}
                    className="w-full bg-black border border-zinc-700 px-3 py-2 pr-10 text-sm outline-none rounded h-10"
                  />
                   
                  {couponInput && (
                    <button
                      type="button"
                      aria-label="Clear coupon code"
                      onClick={handleClearCouponInput}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <button
                  onClick={handleApplyCoupon}
                  className="bg-lime-400 text-black px-4 text-sm font-semibold rounded h-10"
                >
                  APPLY
                </button>
              </div>
            </div>

            {/* SUMMARY */}
            <div className="text-sm space-y-2 border-t border-b border-dashed border-zinc-700 py-4">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-zinc-400">
                <span>Shipping</span>
                <span>${shippingCost.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-lime-300">
                  <span>Discount</span>
                  <span>- ${discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* TOTAL */}
            <div className="flex justify-between mt-5 text-lg font-bold">
              <span>Total</span>
              <span className="text-lime-400">
                ${total.toFixed(2)}
              </span>
            </div>

            {/* BUTTON */}
            <button className="w-full mt-6 bg-lime-400 text-black py-3 font-bold uppercase tracking-wide hover:opacity-90 transition">
              Initiate Transfer
            </button>
          </div>
        </div>
      </div>
    </div >
  );
}

export default CartSections