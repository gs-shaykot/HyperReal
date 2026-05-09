'use client'
import { CartItemWithProductType } from '@/app/types/cartType';
import { couponType } from '@/app/types/couponType';
import { deleteCartItemApi, fetchCartApi, updateCartItemApi } from '@/lib/cartAPIs'
import { getBestCoupon, getDiscount, getNextBestCoupon } from '@/lib/Discount_Calculation_funcs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, ChevronRight, Lock, Package, ShieldCheck, Tags, Trash2, Undo2, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import localFont from "next/font/local";
import { Octagon } from '@/app/components/Octagon';
import { CartSkeleton } from '@/app/(Routes)/cart/CartSkeleton';
import { useRouter } from 'next/navigation';


type CouponProps = {
  coupons: couponType[]
}

const hudson = localFont({
  src: "../../../fonts/Hudson NY Press.woff",
  display: "swap",
})

export const CartSections = ({ coupons }: CouponProps) => {
  const { data: session, status } = useSession();
  const { resolvedTheme } = useTheme();

  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<couponType | null>(null);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const accentColor = mounted && resolvedTheme === 'light' ? '#8fb300' : '#ccff00';

  const { data: cart = [], isPending: isCartPending } = useQuery({
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

  const isNewUser = session?.user?.isNewUser ?? false;

  const subtotal = useMemo(() => {
    return cart.reduce(
      (acc: number, item: CartItemWithProductType) => acc + item.quantity * item.variant.product.price, 0
    )
  }, [cart]);

  const bestCoupon = useMemo(() => {
    return getBestCoupon(coupons, subtotal, isNewUser);
  }, [coupons, subtotal, isNewUser]);

  const nextBestCoupon = useMemo(() => {
    return getNextBestCoupon(coupons, subtotal);
  }, [subtotal, coupons]);


  const discount = appliedCoupon ? getDiscount(appliedCoupon, subtotal) : 0;

  const total = subtotal - discount;


  if (status === "loading") {
    return <CartSkeleton />
  }

  if (!session?.user) {
    return (
      <div className='py-40 flex flex-col items-center justify-center gap-6'>
        <h3 className={`${hudson.className} text-5xl`}>
          CARGO <span className="text-second">HOLD</span>
        </h3>

        <p className='text-zinc-400'>login to access your cargo</p>

        <Link href='/login'>
          <button className='btn bg-second text-black font-bold'>
            LOGIN
          </button>
        </Link>
      </div>
    );
  }

  if (isCartPending) {
    return <CartSkeleton />;
  }

  if (cart.length === 0) {
    return (
      <div className='py-40 flex flex-col items-center justify-center gap-6'>
        <h3 className={`${hudson.className} text-5xl`}>
          CARGO <span className="text-second">HOLD</span>
        </h3>

        <p className='text-zinc-400'>your cart is empty</p>

        <Link href='/products'>
          <button className='btn bg-second text-black font-bold'>
            SHOP THE DROP
          </button>
        </Link>
      </div>
    );
  }

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
  };

  const handleClearCouponInput = () => {
    setCouponInput('');
    setAppliedCoupon(null);
  };

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
    <div className="max-w-7xl mx-auto px-4 text-white pb-20 ">
      {/* HEADER */}
      <h2 className={`${hudson.className} text-5xl font-bold italic py-6 tracking-wide light:text-zinc-900`}>
        CARGO <span className="text-second">HOLD</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* ================= LEFT PANEL ================= */}
        <div className="md:col-span-6 space-y-4">
          {cart.map((item: CartItemWithProductType) => {
            const matchedImage = item.variant.product.productImages.find(
              (img) => img.color === item.variant.color
            )?.imageUrl;

            return (
              <div
                key={item.id}
                className="relative z-20 flex justify-between light:bg-white light:shadow-lg rounded-lg bg-[#1a1a1a] light:border-zinc-200 border border-zinc-800 p-4 overflow-hidden"
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
                  <h3 className="text-lg font-semibold uppercase tracking-wide text-white light:text-zinc-900">
                    {item.variant.product.name}
                  </h3>

                  <p className="text-sm text-zinc-400 light:text-zinc-500 mt-1">
                    {item.variant.product.category.name} {'//'} {item.variant.size}
                  </p>

                  {/* QUANTITY CONTROL */}
                  <div className="flex items-center mt-3">
                    <button
                      className="px-3 py-1 border border-zinc-600 border-r-0 text-zinc-300 light:text-zinc-500 light:hover:text-zinc-800 hover:text-white cursor-pointer"
                      onClick={() => handleUpdateQuantity(item.id!, item.quantity - 1)}
                    >
                      -
                    </button>

                    <span className="border border-zinc-600 px-4 py-1 light:text-zinc-900 text-white">
                      {item.quantity}
                    </span>

                    <button
                      className="px-3 py-1 border border-zinc-600 border-l-0 text-zinc-300 light:text-zinc-500 light:hover:text-zinc-800 hover:text-white cursor-pointer"
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

                  <p className="text-second font-bold text-xl">
                    ${(item.variant.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
          {
            nextBestCoupon && (
              <div className='relative w-full h-31 bg-second/10 light:bg-second/20 border-2 border-second/30 corners z-10'>
                {/* CORNER DESIGNS */}
                <div>
                  <span className='w-7 h-7 absolute -top-4 -left-4 bg-main light:bg-white transform rotate-45' />
                  <span className='w-7 h-7 absolute -bottom-4 -right-4 bg-main light:bg-white transform rotate-45' />

                  <span className='w-7 h-0.5 top-2 -left-1.25 bg-second absolute transform -rotate-45' />
                  <span className='w-4 h-0.5 -top-0.5 left-4.75 bg-second absolute' />
                  <span className='w-0.5 h-4.75 top-4.5 left-0.5 transform -translate-x-[3.4px]  bg-second absolute' />

                  <span className='cornerBar bg-second absolute' />
                  <span className='w-4 h-0.5 -bottom-0.5 right-4 bg-second absolute' />
                  <span className='w-0.5 h-4 bottom-4 right-0 transform translate-x-[1.9px] bg-second absolute' />
                </div>

                <div className='p-2 w-full h-full flex items-start gap-2'>
                  <Octagon icon={<Tags className='scale-x-[-1]' />} opacity='opacity-100' strokeWidth={1.5} color={accentColor} />
                  {/* INFO */}
                  <div className='w-full'>
                    {/* HEADER */}
                    <div className='flex justify-between w-full mb-3'>
                      <div>
                        <h3 className={`text-sm text-second font-medium`}>UNLOCK MORE. SAVE MORE</h3>
                        <p className='text-sm text-white light:text-zinc-900'>Add <span className="text-second">${nextBestCoupon?.updatedCoupons[0].remaining}</span> more to save {" "}
                          {
                            nextBestCoupon?.updatedCoupons[0].type === 'percent' ?
                              <span className="text-second">${nextBestCoupon.updatedCoupons[0].value}%</span> :
                              <span className="text-second">${nextBestCoupon?.updatedCoupons[0].value}</span>
                          }</p>
                      </div>
                      <div className='flex items-center justify-center gap-3 border-b border-dashed border-second/30 light:text-zinc-900'>
                        <p>
                          ${subtotal} / ${nextBestCoupon?.updatedCoupons[0].minSpend}
                        </p>
                        <Lock size={20} strokeWidth={2} />
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className='w-full h-10 '>
                      <div className="flex gap-1">
                        {
                          nextBestCoupon?.updatedCoupons.map((coupon, index) => {

                            const prevMinSpend =
                              index === 0 ? 0 : nextBestCoupon.updatedCoupons[index - 1].minSpend;

                            const segmentRange = coupon.minSpend - prevMinSpend;
                            const progressInSegment = subtotal - prevMinSpend;

                            const widthPercent = Math.max(
                              0,
                              Math.min((progressInSegment / segmentRange) * 100, 100)
                            );

                            return (
                              <div key={coupon.id} className='w-full'>

                                {/* BAR */}
                                <div className='relative w-full h-2 light:bg-zinc-500 bg-zinc-900 rounded-full overflow-hidden'>
                                  <span
                                    className='absolute top-0 left-0 bg-second h-2 shadow-[0_0_6px_#ccff00]'
                                    style={{ width: `${widthPercent}%` }}
                                  />
                                </div>

                                {/* LABELS */}
                                <h4 className='text-xs text-zinc-400 light:text-zinc-500 mt-1'>
                                  SPEND ${coupon.minSpend} & GET
                                </h4>

                                <h5 className='text-xs font-bold text-zinc-400 light:text-zinc-500'>
                                  UP TO {coupon.type === 'percent'
                                    ? `${coupon.value}%`
                                    : `$${coupon.value}`} OFF
                                </h5>

                              </div>
                            );
                          })
                        }
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )
          }

        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="md:col-span-6 light:bg-white bg-[#1a1a1a] border border-zinc-800 light:border-zinc-200 shadow-lg rounded-tl-[28px]">
          <div className=" relative p-4">

            {/* CORNER */}
            <span className="absolute top-0 left-0 w-16 h-16 pointer-events-none">
              <span className='absolute top-0 right-7 w-5 h-px bg-zinc-600' />
              <span className='absolute bottom-7 left-0 w-px h-5 bg-zinc-600' />
              <span className='absolute top-4 left-0 w-5.75 h-px bg-zinc-600 transform -rotate-45 origin-left  drop-shadow-[0_0_5px_#ccff00] ' />
            </span>

            <h3 className={` ${hudson.className} text-3xl mb-6 uppercase light:text-zinc-900`}>
              Manifest Summary
            </h3>

            {
              bestCoupon && !appliedCoupon && (
                <div className="cornerStyle w-full bg-second/5 border-2 border-second/40 p-3 my-5 flex items-center justify-between gap-4">

                  <Octagon icon={<ShieldCheck size={30} strokeWidth={2.2} />} color='#84cc16 ' glow={true} opacity="opacity-60" strokeWidth="3" />

                  <div className='flex-1'>
                    <h2 className='text-base text-second font-bold'>BEST OFFER FOR YOU</h2>
                    <p className='text-xs light:text-zinc-600'>Apply <span className='font-medium'>"{bestCoupon?.code.toUpperCase()}"</span> and get {bestCoupon.type === 'percent' ? `${bestCoupon.value}%` : `$${bestCoupon.value}`} off</p>
                  </div>

                  <button className='btn border-second bg-transparent hover:bg-second hover:text-black text-second' onClick={handleLoadBestCoupon}>
                    Apply <ChevronRight className=' ' />
                  </button>

                </div>
              )
            }

            {/* COUPON */}
            <div className="mb-5">
              <p className="text-xs text-zinc-500 light:text-zinc-600 mb-2">Voucher Protocol</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Enter Code"
                    value={couponInput}
                    onChange={(event) => setCouponInput(event.target.value)}
                    className="w-full bg-black light:bg-transparent border border-zinc-700 px-3 py-2 pr-10 text-sm light:text-zinc-900 outline-none rounded h-10 placeholder:text-zinc-600"
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
                  className="bg-second text-black px-4 text-sm font-semibold rounded h-10 cursor-pointer hover:opacity-90 transition"
                >
                  APPLY
                </button>
              </div>
            </div>

            {/* SUMMARY */}
            <div className="text-sm space-y-2 border-t border-b border-dashed border-zinc-700 py-4">
              <div className="flex justify-between text-zinc-400 light:text-zinc-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-zinc-400 light:text-zinc-600">
                <span>{'//'} Shipping</span>
                <span className='text-sm text-zinc-600 italic'>CALCULATE IN CHECKOUT</span>
              </div>


              <div className="flex justify-between text-second light:text-lime-600">
                <span>Discount</span>
                <span>- ${discount.toFixed(2)}</span>
              </div>

            </div>

            {/* TOTAL */}
            <div className="flex justify-between mt-5 text-lg font-bold">
              <span>Total</span>
              <span className="text-second light:text-lime-600">
                ${total.toFixed(2)}
              </span>
            </div>

            {/* BUTTON */}
            <button onClick={() => router.push(`/checkout?coupon=${appliedCoupon?.code}`)} className="w-full mt-6 bg-second text-black py-3 font-bold uppercase tracking-wide hover:opacity-90 transition cursor-pointer">
              Initiate Transfer
            </button>
          </div>

          <div className='flex justify-between mx-4 border-t border-zinc-600 light:border-second border-dashed py-4'>

            <div className='border-r border-zinc-500 light:border-second border-dashed w-full flex flex-col items-center justify-center gap-1 py-1'>
              <Octagon icon={<ShieldCheck size={30} strokeWidth={2.2} />} color="#52525c" glow={false} opacity='opacity-100' strokeWidth="1" />
              <h3 className='text-sm text-zinc-400'>SECURE CHECKOUT</h3>
              <p className='text-xs text-zinc-400'>Your data is protected</p>
            </div>

            <div className='border-r border-zinc-500 light:border-second border-dashed w-full flex flex-col items-center justify-center gap-1 py-1'>
              <Octagon icon={<Package size={30} strokeWidth={2.2} />} color="#52525c" glow={false} opacity='opacity-100' strokeWidth="1" />
              <h3 className='text-sm text-zinc-400'>FAST SHIPPING</h3>
              <p className='text-xs text-zinc-400'>Delivered to you</p>
            </div>

            <div className='w-full flex flex-col items-center justify-center gap-1 py-1'>
              <Octagon icon={<Undo2 size={30} strokeWidth={2.2} />} color="#52525c" glow={false} opacity='opacity-100' strokeWidth="1" />
              <h3 className='text-sm text-zinc-400'>EASY RETURNS</h3>
              <p className='text-xs text-zinc-400'>30-days returns</p>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}

export default CartSections
