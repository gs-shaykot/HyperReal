'use client'
import { AddressType } from '@/app/types/AddressType'
import { CartItemWithProductType } from '@/app/types/cartType'
import { couponType } from '@/app/types/couponType'
import { getAddresses } from '@/lib/addressApi'
import { fetchCartApi, fetchCouponsApi } from '@/lib/cartAPIs'
import { getDiscount } from '@/lib/Discount_Calculation_funcs'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ArrowLeft, DollarSign, HandCoins, Lock, MapPin, Plus, ShieldCheck, Zap } from 'lucide-react'
import { useSession } from 'next-auth/react'
import localFont from 'next/font/local'
import { useState, useEffect, useMemo, SubmitEventHandler } from 'react'
import { motion } from "framer-motion";
import toast from 'react-hot-toast';
import { CardNumberElement, useElements, useStripe } from '@stripe/react-stripe-js'
import StripeCardForm from '@/app/(Routes)/checkout/StripeCardForm'

const hudson = localFont({
    src: "../../../fonts/Hudson NY Press.woff",
    display: "swap",
});

export const CheckoutContent = ({ couponCode, addressesCount }: { couponCode: string | null; addressesCount: number }) => {
    const { data: session, status, update } = useSession();
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [cardHolderName, setCardHolderName] = useState("");


    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedCountry, setSelectedCountry] = useState({
        name: 'Bangladesh',
        shortName: 'BD',
        value: 'bdt',
        countryCode: '+880'

    });

    const [showAllAddresses, setShowAllAddresses] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(selectedCountry.value === 'bdt' ? 'SSLC' : 'STRIPE');
    const [useSavedAddress, setUseSavedAddress] = useState<AddressType | null>();

    const [addNewAddress, setAddNewAddress] = useState({
        addNew: false,
        isChecked: false,
    });

    const [selectedDeliveryOption, setSelectedDeliveryOption] = useState({
        label: "Standard Drop",
        cost: selectedCountry.value === 'bdt' ? 1.2 : 15,
        estimatedDelivery: selectedCountry.value === 'bdt' ? "3-5" : "10-15",
    });

    const { data: rates = {}, isLoading: isRatesLoading } = useQuery({
        queryKey: ["exchangeRates"],
        queryFn: async () => {
            const res = await fetch("https://open.er-api.com/v6/latest/USD");
            const data = await res.json();
            return data.rates;
        },
        staleTime: 1000 * 60 * 60,
    });

    const { data: cart = [], isPending: isCartPending } = useQuery({
        queryKey: ["cartItems"],
        queryFn: fetchCartApi,
        enabled: status === 'authenticated',
    });

    const { data: coupons = [] } = useQuery({
        queryKey: ['coupons'],
        queryFn: fetchCouponsApi,
        enabled: status === 'authenticated',
    });

    const { data: addresses = [], isLoading: isAddressesLoading } = useQuery({
        queryKey: ["address"],
        queryFn: getAddresses,
        enabled: addressesCount > 0,
    });

    const appliedCoupon = coupons.find((coupon: couponType) => coupon.code === couponCode);

    const subtotal = useMemo(() => {
        return cart.reduce(
            (acc: number, item: CartItemWithProductType) => acc + item.quantity * item.variant.product.price, 0
        )
    }, [cart]);

    const discount = appliedCoupon ? getDiscount(appliedCoupon, subtotal) : 0;

    const shippingCost = selectedDeliveryOption ? selectedDeliveryOption.cost : 0;

    const total = (subtotal + shippingCost) - discount

    const Countries = [
        { name: "Bangladesh", shortName: "BD", value: "bdt", countryCode: "+880" },
        { name: "United States", shortName: "US", value: "usd", countryCode: "+1" },
        { name: "United Kingdom", shortName: "UK", value: "gbp", countryCode: "+44" },
        { name: "Germany", shortName: "DE", value: "eur", countryCode: "+49" },
        { name: "Japan", shortName: "JP", value: "jpy", countryCode: "+81" },
        { name: "Australia", shortName: "AU", value: "aud", countryCode: "+61" },
        { name: "Canada", shortName: "CA", value: "cad", countryCode: "+1" },
        { name: "India", shortName: "IN", value: "inr", countryCode: "+91" },
    ];
    const selectedCountryCode = Countries.find(country => country.value === selectedCountry.value)?.countryCode ?? "";

    const DeliveryOptions = [
        {
            label: "Standard Drop",
            cost: selectedCountry.value === 'bdt' ? 1.2 : 15,
            estimatedDelivery: selectedCountry.value === 'bdt' ? "3-5" : "10-15",
        },
        {
            label: "Express Drop",
            cost: selectedCountry.value === 'bdt' ? 2.5 : 30,
            estimatedDelivery: selectedCountry.value === 'bdt' ? "1-2" : "5-7",
        }
    ]

    useEffect(() => {
        if (selectedCountry.value === 'bdt') {
            if (selectedPaymentMethod !== 'SSLC' && selectedPaymentMethod !== 'COD') {
                setSelectedPaymentMethod('SSLC')
            }
        }
        else {
            if (selectedPaymentMethod !== 'STRIPE') {
                setSelectedPaymentMethod('STRIPE')
            }
        }
    }, [selectedCountry.value])

    const convertPrice = (usdAmount: number) => {
        if (!rates || selectedCountry.value === 'usd') return null;

        const rate = rates[selectedCountry.value.toUpperCase()];
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

    const handlePayment: SubmitEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData(e.currentTarget);

            const fullName = formData.get("fullName") as string;
            const emailInput = formData.get("email") as string;
            const street = formData.get("street") as string;
            const house = formData.get("house") as string;
            const city = formData.get("city") as string;
            const zipCode = formData.get("postalCode") as string;
            const phoneInput = formData.get("phone") as string;
            const label = formData.get("label") as string || '';
            const cleanedPhone = phoneInput.replace(/[^\d]/g, "");
            const nationalPhone = cleanedPhone.replace(/^0+/, "");
            const fullPhoneNumber = `${selectedCountryCode}${nationalPhone}`;

            const paymentData = {
                cartItems: cart,
                country: selectedCountry,
                coupon: appliedCoupon?.code,
                paymentMethod: selectedPaymentMethod,
                address: useSavedAddress || {
                    label: label,
                    fullName,
                    street,
                    city,
                    house,
                    zipCode,
                    phone: fullPhoneNumber,
                },
                saveAddress: addNewAddress.isChecked,
                deliveryOption: selectedDeliveryOption.label,
            };

            const res = await axios.post("/api/order", paymentData);
            const data = res.data;

            if (!data.success) {
                toast.error(data.message || "Failed to create order");
                setIsSubmitting(false);
                return;
            }

            if (selectedPaymentMethod === 'STRIPE') {
                if (!stripe || !elements) {
                    toast.error("Stripe is not ready yet.");
                    return;
                }

                if (!data.clientSecret) {
                    toast.error("Unable to initialize Stripe payment.");
                    setIsSubmitting(false);
                    return;
                }

                const cardElement = elements.getElement(CardNumberElement);

                if (!cardElement) {
                    toast.error("Card information is not ready.");
                    setIsSubmitting(false);
                    return;
                }

                if (!cardHolderName.trim()) {
                    toast.error("Please enter the card holder name.");
                    setIsSubmitting(false);
                    return;
                }
                setIsProcessingPayment(true);

                try {
                    const result = await stripe.confirmCardPayment(data.clientSecret, {
                        payment_method: {
                            card: cardElement,
                            billing_details: {
                                name: cardHolderName,
                            },
                        },
                    })
                    if (result.error) {
                        console.error(
                            "[Stripe] Payment confirmation failed:",
                            result.error
                        );

                        toast.error(
                            result.error.message ??
                            "Payment failed."
                        );

                        return;
                    };

                    const paymentIntent = result.paymentIntent;

                    if (paymentIntent.status === "succeeded") {

                        console.log(
                            "[Stripe] PaymentIntent succeeded:",
                            paymentIntent.id
                        );

                        console.log(
                            "[Stripe] Order ID:",
                            data.orderId
                        );

                        console.log(
                            "[Stripe] Redirect URL:",
                            `/success?orderId=${data.orderId}`
                        );
                        const redirectUrl = `/success?orderId=${encodeURIComponent(data.orderId)}`;

                        toast.success("Payment Successfully Done");

                        window.location.href = redirectUrl;
                        return
                    }
                    else {
                        toast.error("Payment failed. Please try again.");
                    }
                }
                finally {
                    setIsProcessingPayment(false);
                }
            }
            else if (selectedPaymentMethod === "COD") {
                window.location.href = `/success?orderId=${encodeURIComponent(data.orderId)}`;
                return;
            }
            else {
                if (!data.paymentUrl) {
                    toast.error("Payment gateway URL is missing.");
                    setIsSubmitting(false);
                    return;
                }

                await update();
                window.location.href = data.paymentUrl;

                return;
            }

        }
        catch (error: any) {
            console.error("Payment submission error:", error);
            toast.error(error.response?.data?.message || "Payment processing failed. Please try again.");
            setIsSubmitting(false);
        }
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

                <div
                    key={useSavedAddress?.id ?? "manual"}
                    className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* LEFT PANEL */}
                    <form
                        onSubmit={handlePayment}
                        className="md:col-span-8"
                    >
                        {/* Delivery Coordinates */}
                        <div className="bg-[#0f0f0f] light:bg-[#f5f6f8] p-6 border border-zinc-800 mb-8">
                            <h2 className="text-sm tracking-widest text-second mb-5 font-mono">
                                — 01 // DELIVERY COORDINATES
                            </h2>

                            {/* Saved Addresses */}
                            <div>
                                <h3 className="mb-2 text-sm text-zinc-500 light:text-zinc-700">
                                    // Use Saved Address
                                </h3>

                                {/* No saved addresses */}
                                {addressesCount === 0 && (
                                    <div className="border border-zinc-800 p-4 mb-3">
                                        <p className="text-xs text-zinc-500 light:text-zinc-700">
                                            No saved addresses found. Please add an address in your profile.
                                        </p>
                                    </div>
                                )}

                                {/* Loading skeleton */}
                                {addressesCount > 0 && isAddressesLoading && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                        {Array.from({ length: addressesCount }).map((_, index) => (
                                            <div
                                                key={index}
                                                className="border border-zinc-800 p-3"
                                            >
                                                <div className="animate-pulse">
                                                    <div className="h-3 bg-zinc-800 w-20 mb-3" />
                                                    <div className="h-3.5 bg-zinc-800 w-32 mb-2" />
                                                    <div className="h-3 bg-zinc-800 w-4/5 mb-1" />
                                                    <div className="h-3 bg-zinc-800 w-2/3" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Saved address cards */}
                                <div>
                                    {addressesCount > 0 && !isAddressesLoading && (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                                {(showAllAddresses
                                                    ? addresses
                                                    : addresses.slice(0, 3)
                                                ).map((address: AddressType) => (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (useSavedAddress?.id === address.id) {
                                                                setUseSavedAddress(null);
                                                                return;
                                                            }
                                                            setUseSavedAddress(address);
                                                            setAddNewAddress((prev) => ({
                                                                ...prev,
                                                                addNew: false,
                                                                isChecked: false,
                                                            }));
                                                            const savedCountry = Countries.find(
                                                                (country) => country.name === address.country
                                                            );
                                                            if (savedCountry) {
                                                                setSelectedCountry(savedCountry);
                                                            }
                                                        }}
                                                        key={address.id}
                                                        className={`${address.id === useSavedAddress?.id
                                                            ? "border-second bg-second/10"
                                                            : "border-zinc-800 bg-transparent"
                                                            } border p-3 cursor-pointer btn flex flex-col h-auto rounded-none items-start hover:border-second relative`}
                                                    >
                                                        <div className="flex items-center justify-start gap-2">
                                                            <h3 className="text-xs text-zinc-400 flex items-center gap-2 mb-1">
                                                                <MapPin
                                                                    size={14}
                                                                    className="text-second"
                                                                />
                                                                {address.label?.toUpperCase()}
                                                            </h3>
                                                            {address.isDefault && (
                                                                <span className="text-xs text-second">
                                                                    {/* PRIMARY */}
                                                                    PRIMARY
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h3 className="text-sm">
                                                            {address.fullName}
                                                        </h3>
                                                        <h3 className="text-xs text-start">
                                                            {address.house}, {address.street}. {address.city}
                                                        </h3>
                                                    </button>
                                                ))}
                                                {/* New Address Card */}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setAddNewAddress((prev) => ({
                                                            isChecked: prev.addNew ? true : false,
                                                            addNew: !prev.addNew,
                                                        }));
                                                        setUseSavedAddress(null);
                                                    }}
                                                    className={`btn h-26 rounded-none border ${addNewAddress.addNew
                                                        ? "bg-second/15 border-second"
                                                        : "bg-transparent border-zinc-700"
                                                        } hover:border-second border-dashed flex flex-col shadow-none`}
                                                >
                                                    <Plus size={18} />
                                                    NEW ADDRESS
                                                </button>
                                            </div>
                                            {/* Show All / Show Less */}
                                            {addressesCount > 4 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAllAddresses((prev) => !prev)}
                                                    className="btn w-full rounded-none border border-zinc-700 bg-transparent hover:border-second text-xs tracking-[0.3em]"
                                                >
                                                    {showAllAddresses
                                                        ? "SHOW LESS"
                                                        : `SHOW ALL ADDRESSES (${addressesCount})`}
                                                </button>
                                            )}
                                        </>
                                    )}

                                    {
                                        addressesCount === 0 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAddNewAddress((prev) => ({
                                                        isChecked: prev.addNew ? true : false,
                                                        addNew: !prev.addNew,
                                                    }));
                                                    setUseSavedAddress(null);
                                                }}
                                                className={`btn w-full h-26 rounded-none border ${addNewAddress.addNew
                                                    ? "bg-second/15 light:bg-second/30 border-second"
                                                    : "bg-transparent border-zinc-700"
                                                    } hover:border-second border-dashed flex flex-col shadow-none`}
                                            >
                                                <Plus size={18} />
                                                NEW ADDRESS
                                            </button>
                                        )
                                    }

                                </div>
                            </div>

                            {/* User Details */}
                            <div
                                className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
                            >
                                {/* Full Name */}
                                <div>
                                    <label className="label label-text text-xs text-gray-400 light:text-gray-700 uppercase">
                                        Full Name
                                    </label>

                                    <input
                                        name="fullName"
                                        type="text"
                                        defaultValue={
                                            useSavedAddress
                                                ? useSavedAddress.fullName
                                                : session?.user.name ?? ""
                                        }
                                        placeholder="JANE DOE"
                                        required
                                        className="input w-full bg-black light:bg-white border border-gray-900 rounded-none focus:outline-none focus:border-second text-sm tracking-wide placeholder:text-zinc-600"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="label label-text text-xs text-gray-400 light:text-gray-700 uppercase">
                                        Email
                                    </label>

                                    <input
                                        name="email"
                                        type="email"
                                        defaultValue={session?.user.email ?? ""}
                                        placeholder="USER@GRID.NET"
                                        required
                                        className="input w-full bg-black light:bg-white border border-gray-900 rounded-none focus:outline-none focus:border-second text-sm tracking-wide placeholder:text-zinc-600"
                                    />
                                </div>

                                {/* Street */}
                                <div>
                                    <label className="label label-text text-xs text-gray-400 light:text-gray-700 uppercase">
                                        Street
                                    </label>

                                    <input
                                        defaultValue={useSavedAddress?.street}
                                        name="street"
                                        type="text"
                                        placeholder='42 NEON ST, SECTOR 7'
                                        className="input w-full bg-black light:bg-white border border-gray-900 rounded-none focus:outline-none focus:border-second text-sm tracking-wide placeholder:text-zinc-600"
                                    />
                                </div>

                                {/* House / Apartment */}
                                <div>
                                    <label className="label label-text text-xs text-gray-400 light:text-gray-700 uppercase">
                                        House / Apartment
                                    </label>

                                    <input
                                        defaultValue={useSavedAddress?.house}
                                        name="house"
                                        type="text"
                                        placeholder='APT 42B'
                                        className="input w-full bg-black light:bg-white border border-gray-900 rounded-none focus:outline-none focus:border-second text-sm tracking-wide placeholder:text-zinc-600"
                                    />
                                </div>

                                {/* City */}
                                <div>
                                    <label className="label label-text text-xs text-gray-400 light:text-gray-700 uppercase">
                                        City
                                    </label>

                                    <input
                                        name="city"
                                        type="text"
                                        defaultValue={useSavedAddress?.city ?? ""}
                                        placeholder="YOUR ORBITAL CITY"
                                        required
                                        className="input w-full bg-black light:bg-white border border-gray-900 rounded-none focus:outline-none focus:border-second text-sm tracking-wide placeholder:text-zinc-600"
                                    />
                                </div>

                                {/* Postal Code */}
                                <div>
                                    <label className="label label-text text-xs text-gray-400 light:text-gray-700 uppercase">
                                        Postal Code
                                    </label>

                                    <input
                                        name="postalCode"
                                        type="text"
                                        defaultValue={useSavedAddress?.zipCode ?? ""}
                                        placeholder="00000"
                                        required
                                        className="input w-full bg-black light:bg-white border border-gray-900 rounded-none focus:outline-none focus:border-second text-sm tracking-wide placeholder:text-zinc-600"
                                    />
                                </div>

                                {/* Country */}
                                <div>
                                    <label className="label label-text text-xs text-gray-400 light:text-gray-700 uppercase">
                                        Delivery Country
                                    </label>

                                    <select
                                        value={
                                            useSavedAddress ? Countries.find((country) => country.name === useSavedAddress.country)?.value : selectedCountry.value
                                        }
                                        onChange={(e) => {
                                            setUseSavedAddress(null);
                                            setSelectedCountry(
                                                Countries.find(
                                                    (country) => country.value === e.target.value) || Countries[0]
                                            )
                                        }}
                                        className="select w-full bg-black light:bg-white border border-gray-900 rounded-none focus:outline-none focus:border-second text-sm"
                                    >
                                        {Countries.map((country) => (
                                            <option
                                                key={country.name}
                                                value={country.value}
                                                className="hover:bg-second hover:text-zinc-900"
                                            >
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <label className="label label-text text-xs text-gray-400 uppercase">
                                        Phone Number <span className="text-[10px] tracking-wider">(without country code)</span>
                                    </label>

                                    <div className="flex w-full">
                                        <div className="flex items-center px-3 bg-black light:bg-white border border-r-0 border-gray-900 text-sm text-second">
                                            {selectedCountryCode}
                                        </div>

                                        <input
                                            name="phone"
                                            type="tel"
                                            defaultValue={useSavedAddress?.phone.replace(selectedCountryCode, '') ?? ""}
                                            placeholder="PHONE NUMBER"
                                            required
                                            className="input flex-1 bg-black light:bg-white border border-gray-900 rounded-none focus:outline-none focus:border-second text-sm tracking-wide placeholder:text-zinc-600"
                                        />
                                    </div>
                                </div>
                            </div>
                            {
                                addNewAddress.addNew && (
                                    // Save Address Checkbox
                                    < motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className='mt-4 mb-3 border-t border-zinc-800 border-dashed'>
                                        <label
                                            className="flex items-start pt-3 gap-5 bg-[#0f0f0f] light:bg-[#f5f6f8] cursor-pointer">
                                            <input
                                                onClick={() => setAddNewAddress((prev) => ({ ...prev, isChecked: !prev.isChecked }))}
                                                type="checkbox"
                                                defaultChecked={addNewAddress.isChecked}
                                                name="saveAddress"
                                                className="checkbox w-5 h-5 checkbox-neutral rounded-none border-second checked:bg-second checked:text-black checked:border-second"
                                            />

                                            <div>
                                                <h3 className="text-xs font-bold tracking-widest uppercase text-zinc-100 light:text-zinc-800">
                                                    Save this address for later autofill
                                                </h3>

                                                <p className="text-xs text-zinc-500 light:text-zinc-600 tracking-widest uppercase mt-1">
                                                    Stored in your profile → Addresses
                                                </p>
                                            </div>
                                        </label>
                                    </motion.div>
                                )
                            }
                            {
                                addNewAddress.isChecked && addNewAddress.addNew && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div>
                                            <label className="label label-text text-xs text-gray-400 light:text-gray-700  uppercase">
                                                LABEL (OPTIONAL)
                                            </label>

                                            <input
                                                name="label"
                                                type="text"
                                                placeholder="HOME / OFFICE / DROPZONE"
                                                className="uppercase input w-full bg-black light:bg-white border border-gray-900 rounded-none focus:outline-none focus:border-second text-sm tracking-wide placeholder:text-zinc-600"
                                            />
                                        </div>
                                    </motion.div>
                                )
                            }
                        </div>

                        {/* Delivery Options */}
                        <div className="bg-[#0f0f0f] light:bg-[#f5f6f8] p-6 border border-zinc-800 mb-8">
                            <h2 className="text-sm tracking-widest text-second mb-5 font-mono">
                                — 02 // DELIVERY METHODS
                            </h2>

                            <div className='grid grid-cols-2 gap-4'>
                                {
                                    DeliveryOptions.map((option, index) => (
                                        <button key={index} type={'button'}
                                            className={`btn flex justify-between items-center px-5 py-10 bg-main rounded-none shadow-none text-start ${selectedDeliveryOption.label === option.label ? 'bg-second/15 light:bg-second/30 border-second' : 'bg-main light:bg-white hover:bg-second/10 hover:border-second'}`}
                                            onClick={() => setSelectedDeliveryOption(option)}
                                        >
                                            <div>
                                                <h3>{option.label}</h3>
                                                <h3 className='text-zinc-400 light:text-zinc-700 text-xs mt-2 font-extralight'>ETA // {option.estimatedDelivery} Days</h3>
                                            </div>
                                            <h3 className='self-end'>${option.cost}</h3>
                                        </button>
                                    ))
                                }
                            </div>
                        </div>

                        {/* Payment Options */}
                        <div className="bg-[#0f0f0f] light:bg-[#f5f6f8] p-6 border border-zinc-800">
                            <h2 className="text-sm tracking-widest text-second mb-6 font-mono">
                                — 03 // Payment Gateway
                            </h2>

                            <div className="flex flex-col gap-3 pb-6">
                                {selectedCountry.value === "bdt" ? (
                                    [
                                        {
                                            label: "SSLCOMMERZ",
                                            value: "SSLC",
                                            desc: "bKash / Nagad / Rocket / Local Cards",
                                            icon: <Zap className="text-second" />,
                                        },
                                        {
                                            label: "STRIPE",
                                            value: "STRIPE",
                                            desc: "International Cards, Apple Pay, Google Pay",
                                            icon: <DollarSign className="text-second" />,
                                        },
                                        {
                                            label: "CASH ON DELIVERY",
                                            value: "COD",
                                            desc: "Pay with cash upon delivery",
                                            icon: <HandCoins className="text-second" />,
                                        },
                                    ].map((method) => (
                                        <button
                                            type="button"
                                            key={method.value}
                                            onClick={() =>
                                                setSelectedPaymentMethod(method.value)
                                            }
                                            className={`btn rounded-none h-20 p-3 shadow-none transition-all cursor-pointer flex items-center justify-between gap-6 ${selectedPaymentMethod === method.value
                                                ? "bg-second/15 light:bg-second/25 border-second"
                                                : "bg-second/5 light:bg-white border-second/5 hover:bg-second/10 hover:border-second"
                                                } border`}
                                        >
                                            <div className="w-14 h-14 flex justify-center items-center border border-second">
                                                {method.icon}
                                            </div>

                                            <div className="flex-1 text-white light:text-zinc-700 text-start">
                                                <h3>{method.label}</h3>
                                                <p className="text-xs ">
                                                    {method.desc}
                                                </p>
                                            </div>

                                            <ShieldCheck
                                                size={18}
                                                className="text-second"
                                            />
                                        </button>
                                    ))
                                ) : (
                                    [
                                        {
                                            label: "STRIPE",
                                            value: "STRIPE",
                                            desc: "International Cards, Apple Pay, Google Pay",
                                            icon: <DollarSign className="text-second" />,
                                        },
                                    ].map((method) => (
                                        <button
                                            type="button"
                                            key={method.value}
                                            onClick={() =>
                                                setSelectedPaymentMethod(method.value)
                                            }
                                            className={`btn rounded-none h-20 p-3 shadow-none transition-all cursor-pointer flex items-center justify-between gap-6 ${selectedPaymentMethod === method.value
                                                ? "bg-second/15 border-second"
                                                : "bg-second/5 border-second/5 hover:bg-second/10 hover:border-second"
                                                } border`}
                                        >
                                            <div className="w-14 h-14 flex justify-center items-center border border-second">
                                                {method.icon}
                                            </div>

                                            <div className="flex-1 text-start">
                                                <h3>{method.label}</h3>
                                                <p className="text-xs text-gray-400">
                                                    {method.desc}
                                                </p>
                                            </div>

                                            <ShieldCheck
                                                size={18}
                                                className="text-second"
                                            />
                                        </button>
                                    ))
                                )}
                            </div>

                            {
                                selectedPaymentMethod === "STRIPE" && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className='border-t border-dashed border-zinc-700'
                                    >
                                        <StripeCardForm
                                            cardHolderName={cardHolderName}
                                            onCardHolderNameChange={setCardHolderName}
                                        />
                                    </motion.div>
                                )
                            }

                        </div>

                        {/* Submit Payment */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn mt-4 w-full rounded-none bg-second text-zinc-900 font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                        >
                            {isSubmitting
                                ? "PROCESSING PAYMENT..."
                                : selectedPaymentMethod === "STRIPE" || selectedPaymentMethod === "COD"
                                    ? `PAY $${total.toFixed(2)}`
                                    : `PAY ~${formatCurrency(
                                        convertedTotal!,
                                        selectedCountry.value
                                    )}`}
                        </button>
                    </form>

                    {/* RIGHT PANEL */}
                    <div className='md:col-span-4 lg:sticky lg:top-19.5 lg:self-start '>
                        <div className='bg-[#0f0f0f] light:bg-[#f5f6f8] p-6 border border-zinc-800'>
                            <h2 className="text-sm tracking-widest text-second mb-6 font-mono">
                                — Manifest
                            </h2>
                            <div className='w-full h-auto overflow-y-auto mb-4 pr-2'>
                                {
                                    cart.map((item: CartItemWithProductType) => (
                                        <div key={item.id} className='mb-2 border-zinc-800 border p-2 flex items-center justify-between'>
                                            <div>
                                                <h3 className='text-xs'>{item.variant.product.name}</h3>
                                                <p className='text-xs text-zinc-400 light:text-zinc-600'>{item.quantity} x ${item.variant.product.price.toFixed(2)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className='text-second text-xs'>
                                                    ${(item.variant.product.price * item.quantity).toFixed(2)}
                                                </p>

                                                {
                                                    selectedCountry.value !== 'usd' && (
                                                        <p className="text-[10px] text-second/70 light:text-second">
                                                            ~ {
                                                                formatCurrency(
                                                                    convertPrice(item.variant.product.price * item.quantity) || 0,
                                                                    selectedCountry.value
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
                                        selectedCountry.value !== 'usd' && convertedTotal !== null && (
                                            <div className="flex justify-between text-xs text-zinc-400 mt-1">
                                                <span>Approx.</span>
                                                <span>
                                                    ~ {formatCurrency(convertedTotal, selectedCountry.value)}
                                                </span>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    )
}
