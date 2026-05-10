'use client'
import { CartItemWithProductType } from '@/app/types/cartType'
import { couponType } from '@/app/types/couponType'
import { fetchCartApi, fetchCouponsApi } from '@/lib/cartAPIs'
import { getDiscount } from '@/lib/Discount_Calculation_funcs'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ArrowLeft, DollarSign, HandCoins, Lock, ShieldCheck, Zap } from 'lucide-react'
import { useSession } from 'next-auth/react'
import localFont from 'next/font/local'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'


const hudson = localFont({
    src: "../../../fonts/Hudson NY Press.woff",
    display: "swap",
})

export const CheckoutPage = ({ couponCode }: { couponCode: string | null }) => {
    const { data: session, status } = useSession();

    const [selectedCountry, setSelectedCountry] = useState('bdt');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(selectedCountry === 'bdt' ? 'sslc' : 'stripe');
    const [selectedAddress, setSelectedAddress] = useState('');

    const { data: rates = {}, isLoading: isRatesLoading } = useQuery({
        queryKey: ["exchangeRates"],
        queryFn: async () => {
            const res = await fetch("https://open.er-api.com/v6/latest/USD");
            const data = await res.json();
            return data.rates;
        },
        staleTime: 1000 * 60 * 60, // 1 hour cache
    });

    const { data: cart = [], isPending: isCartPending } = useQuery({
        queryKey: ["cartItems"],
        queryFn: fetchCartApi,
        enabled: !!session?.user,
    });

    const { data: coupons = [] } = useQuery({
        queryKey: ['coupons'],
        queryFn: fetchCouponsApi,

    });

    const appliedCoupon = coupons.find((coupon: couponType) => coupon.code === couponCode);

    const subtotal = useMemo(() => {
        return cart.reduce(
            (acc: number, item: CartItemWithProductType) => acc + item.quantity * item.variant.product.price, 0
        )
    }, [cart]);

    const discount = appliedCoupon ? getDiscount(appliedCoupon, subtotal) : 0;

    const shippingCost = selectedCountry === 'bdt' ? 1.2 : 20;

    const total = (subtotal + shippingCost) - discount

    const Countries = [
        { name: 'Bangladesh (BDT)', value: 'bdt' },
        { name: 'United States (USD)', value: 'usd' },
        { name: 'United Kingdom (GBP)', value: 'gbp' },
        { name: 'Germany (EUR)', value: 'eur' },
        { name: 'Japan (JPY)', value: 'jpy' },
        { name: 'Australia (AUD)', value: 'aud' },
        { name: 'Canada (CAD)', value: 'cad' },
        { name: 'India (INR)', value: 'inr' },
    ]

    const paymentMethods = [
        { name: 'SSLCOMMERZ', value: 'sslc' },
        { name: 'STRIPE', value: 'stripe' },
        { name: 'CASH ON DELIVERY', value: 'cod' },
    ]

    useEffect(() => {
        if (selectedCountry === 'bdt') {
            if (selectedPaymentMethod !== 'sslc' && selectedPaymentMethod !== 'cod') {
                setSelectedPaymentMethod('sslc')
            }
        }
        else {
            if (selectedPaymentMethod !== 'stripe') {
                setSelectedPaymentMethod('stripe')
            }
        }
    }, [selectedCountry])

    const convertPrice = (usdAmount: number) => {
        if (!rates || selectedCountry === 'usd') return null;

        const rate = rates[selectedCountry.toUpperCase()];
        if (!rate) return null;

        return usdAmount * rate;
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: currency.toUpperCase(),
        }).format(amount);
    };

    const convertedTotal = convertPrice(total);

    const handlePayment = async (cartItems: CartItemWithProductType[], country: string, coupon: string, paymentMethod: string, address: string) => {
        const paymentData = {
            cartItems,
            country,
            coupon,
            paymentMethod,
            address,
        };

        const res = await axios.post("/api/order", paymentData);
    }

    return (
        <div className=' bg-main light:bg-white py-10'>
            <div className="max-w-7xl mx-auto p-4">
                {/* HEADER */}
                <div className='pb-8'>
                    <button onClick={() => window.history.back()} className='text-xs flex items-center gap-2 text-zinc-300 light:text-zinc-700 cursor-pointer mb-2'>
                        <ArrowLeft size={18} /> Back to Cargo Hold
                    </button>
                    <h2 className={`${hudson.className} text-5xl light:text-zinc-900`} style={{ wordSpacing: '10px' }}>
                        SECURE <span className="text-second">TRANSFER</span>
                    </h2>
                    <div className='text-xs flex items-center py-3 text-zinc-400 mt-1 w-4/12' style={{ wordSpacing: '5px' }}>
                        <Lock size={16} className='mr-1' />
                        <h3>Encrypted Payment Protocol // 256-BIT</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* LEFT PANEL */}
                    <div className='md:col-span-8'>
                        <div className='bg-[#0f0f0f] p-6 border border-zinc-800 mb-8'>
                            <h2 className="text-sm tracking-widest text-second mb-6 font-mono">
                                — 01 // DELIVERY COORDINATES
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Full Name */}
                                <div>
                                    <label className="label label-text text-xs text-gray-400 uppercase">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="JANE DOE"
                                        className="input w-full bg-black border border-gray-900 rounded-none focus:outline-none focus:border-second text-sm tracking-wide placeholder:text-zinc-600"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="label label-text text-xs text-gray-400 uppercase">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="USER@GRID.NET"
                                        className="input w-full bg-black border border-gray-900 rounded-none focus:outline-none focus:border-second text-sm tracking-wide placeholder:text-zinc-600"
                                    />
                                </div>

                                {/* Address  */}
                                <div className="md:col-span-2">
                                    <label className="label label-text text-xs text-gray-400 uppercase">
                                        Address
                                    </label>
                                    <input
                                        onChange={(e) => setSelectedAddress(e.target.value)}
                                        type="text"
                                        placeholder="42 NEON ST, SECTOR 7"
                                        className="input w-full bg-black border border-gray-900 rounded-none focus:outline-none focus:border-second text-sm tracking-wide placeholder:text-zinc-600"
                                    />
                                </div>

                                {/* City */}
                                <div>
                                    <label className="label label-text text-xs text-gray-400 uppercase">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="YOUR ORBITAL CITY"
                                        className="input w-full bg-black border border-gray-900 rounded-none focus:outline-none focus:border-second text-sm tracking-wide placeholder:text-zinc-600"
                                    />
                                </div>

                                {/* Postal Code */}
                                <div>
                                    <label className="label label-text text-xs text-gray-400 uppercase">
                                        Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="00000"
                                        className="input w-full bg-black border border-gray-900 rounded-none focus:outline-none focus:border-second text-sm tracking-wide placeholder:text-zinc-600"
                                    />
                                </div>

                                {/* Country (full width) */}
                                <div className="md:col-span-2">
                                    <label className="label label-text text-xs text-gray-400 uppercase">
                                        Delivery Country
                                    </label>

                                    <select
                                        value={selectedCountry}
                                        onChange={(e) => setSelectedCountry(e.target.value)}
                                        className="select w-full bg-black border border-gray-900 rounded-none focus:outline-none focus:border-second text-sm"
                                    >
                                        {
                                            Countries.map((country) => (
                                                <option key={country.value} value={country.value} className='hover:bg-second hover:text-zinc-900'>
                                                    {country.name}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>

                            </div>
                        </div>

                        <div className='bg-[#0f0f0f] p-6 border border-zinc-800'>
                            <h2 className="text-sm tracking-widest text-second mb-6 font-mono">
                                — 02 // Payment Gateway
                            </h2>

                            <div className="flex flex-col gap-3">
                                {
                                    selectedCountry === 'bdt' ? (
                                        [
                                            { label: 'SSLCOMMERZ', value: 'sslc', desc: 'bKash / Nagad / Rocket / Local Cards', icon: <Zap className='text-second' /> },
                                            { label: 'STRIPE', value: 'stripe', desc: 'International Cards, Apple Pay, Google Pay', icon: <DollarSign className='text-second' /> },
                                            { label: 'CASH ON DELIVERY', value: 'cod', desc: 'Pay with cash upon delivery', icon: <HandCoins className='text-second' /> }
                                        ].map((method) => (
                                            <button
                                                key={method.value}
                                                onClick={() => setSelectedPaymentMethod(method.value)}
                                                className={`btn rounded-none h-20 p-3 shadow-none transition-all cursor-pointer flex items-center justify-between gap-6 ${selectedPaymentMethod === method.value
                                                    ? 'bg-second/15 border-second'
                                                    : 'bg-second/5 border-second/5 hover:bg-second/10 hover:border-second'
                                                    } border`}
                                            >
                                                <div className='w-14 h-14 flex justify-center items-center border border-second'>
                                                    {method.icon}
                                                </div>
                                                <div className='flex-1 text-start'>
                                                    <h3>{method.label}</h3>
                                                    <p className="text-xs text-gray-400">{method.desc}</p>
                                                </div>
                                                <ShieldCheck size={18} className='text-second' />
                                            </button>
                                        ))
                                    ) : (
                                        [
                                            { label: 'STRIPE', value: 'stripe', desc: 'International Cards, Apple Pay, Google Pay', icon: <DollarSign className='text-second' /> },
                                        ].map((method) => (
                                            <button
                                                key={method.value}
                                                onClick={() => setSelectedPaymentMethod(method.value)}
                                                className={`btn rounded-none h-20 p-3 shadow-none transition-all cursor-pointer flex items-center justify-between gap-6 ${selectedPaymentMethod === method.value
                                                    ? 'bg-second/15 border-second'
                                                    : 'bg-second/5 border-second/5 hover:bg-second/10 hover:border-second'
                                                    } border`}
                                            >
                                                <div className='w-14 h-14 flex justify-center items-center border border-second'>
                                                    {method.icon}
                                                </div>
                                                <div className='flex-1 text-start'>
                                                    <h3>{method.label}</h3>
                                                    <p className="text-xs text-gray-400">{method.desc}</p>
                                                </div>
                                                <ShieldCheck size={18} className='text-second' />
                                            </button>
                                        ))
                                    )
                                }
                            </div>
                        </div>


                        <button onClick={() => handlePayment(cart, selectedCountry, couponCode!, selectedPaymentMethod, selectedAddress)} className="btn mt-4 w-full rounded-none bg-second text-zinc-900">PAY {total.toFixed(2)}</button>
                    </div>

                    {/* RIGHT PANEL */}
                    <div className='md:col-span-4 lg:sticky lg:top-19.5 lg:self-start '>
                        <div className='bg-[#0f0f0f] p-6 border border-zinc-800'>
                            <h2 className="text-sm tracking-widest text-second mb-6 font-mono">
                                — Manifest
                            </h2>
                            <div>
                                {
                                    cart.map((item: CartItemWithProductType) => (
                                        <div key={item.id} className='mb-2 border-zinc-800 border p-2 flex items-center justify-between'>
                                            <div>
                                                <h3 className='text-xs'>{item.variant.product.name}</h3>
                                                <p className='text-xs text-zinc-400'>{item.quantity} x ${item.variant.product.price.toFixed(2)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className='text-second text-xs'>
                                                    ${(item.variant.product.price * item.quantity).toFixed(2)}
                                                </p>

                                                {
                                                    selectedCountry !== 'usd' && (
                                                        <p className="text-[10px] text-second/70">
                                                            ~ {
                                                                formatCurrency(
                                                                    convertPrice(item.variant.product.price * item.quantity) || 0,
                                                                    selectedCountry
                                                                )
                                                            }
                                                        </p>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>

                            {/* SUMMARY */}
                            <div className="text-sm space-y-2 border-t border-b border-dashed border-zinc-700 py-4">
                                <div className="flex justify-between text-zinc-400 light:text-zinc-600">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between text-zinc-400 light:text-zinc-600">
                                    <span>Shipping</span>
                                    <span className='text-sm italic'>${shippingCost}</span>
                                </div>


                                <div className="flex justify-between text-lime-300 light:text-lime-600">
                                    <span>Discount</span>
                                    <span>-${discount.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between mt-5 text-lg font-bold">
                                <span>Total</span>
                                <div className="flex flex-col justify-end items-end">
                                    <span className="text-second light:text-lime-600">
                                        ${total.toFixed(2)}
                                    </span>
                                    {
                                        selectedCountry !== 'usd' && convertedTotal !== null && (
                                            <div className="flex justify-between text-xs text-zinc-400 mt-1">
                                                <span>Approx.</span>
                                                <span>
                                                    ~ {formatCurrency(convertedTotal, selectedCountry)}
                                                </span>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
