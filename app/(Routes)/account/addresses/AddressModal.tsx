"use client";
import { useAddress } from "@/app/Hooks/useAddress";
import { getAddresses } from "@/lib/addressApi";
import { useQuery } from "@tanstack/react-query";
import { on } from "events";
import { X, Save } from "lucide-react";
import { useState } from "react";

type AddressModalProps = {
    open: boolean;
    onCloseAction: () => void;
};

export default function AddressModal({ open, onCloseAction, }: AddressModalProps) {
    const [selectedCountry, setSelectedCountry] = useState({
        value: 'bdt',
        shortName: 'BD',
    });

    const addressMutation = useAddress();
    const { data: addresses, isLoading } = useQuery({
        queryKey: ["address"],
        queryFn: getAddresses
    });
    if (!open) return null;

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

    const handleSubmit = (formData: FormData) => {
        const data = {
            label: formData.get("label")?.toString().trim() || "Home",
            fullName: formData.get("fullName")?.toString().trim() || "",
            street: formData.get("street")?.toString().trim() || "",
            house: formData.get("house")?.toString().trim() || "",
            city: formData.get("city")?.toString().trim() || "",
            zipCode: formData.get("zipCode")?.toString().trim() || "",
            country: formData.get("country")?.toString().trim() || "",
            phone: formData.get("phone")?.toString().trim() || "",
        };
        addressMutation.mutate(data);
        if (!isLoading) {
            onCloseAction();
        }
    }

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-xl rounded-none border border-base-300 bg-main p-8 shadow-xl">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-2xl font-bold uppercase tracking-widest">
                        New Drop Location
                    </h2>

                    <button
                        onClick={onCloseAction}
                        className="btn btn-ghost btn-square btn-sm"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form action={handleSubmit} className="space-y-6">
                    {/* Label */}
                    <div>
                        <label className="mb-2 block text-sm uppercase tracking-widest">
                            Label
                        </label>

                        <input
                            name="label"
                            type="text"
                            placeholder="HOME / OFFICE"
                            className="input input-bordered w-full rounded-none bg-[#0f0f0f] border-2 border-zinc-800 focus:border-second outline-0 uppercase focus:outline-none"
                        />
                    </div>

                    {/* Full Name */}
                    <div>
                        <label className="mb-2 block text-sm uppercase tracking-widest">
                            Full Name
                        </label>

                        <input
                            name="fullName"
                            type="text"
                            className="input input-bordered w-full rounded-none bg-[#0f0f0f] border-2 border-zinc-800 focus:border-second outline-0"
                        />
                    </div>

                    {/* Address */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        <div>
                            <label className="mb-2 block text-sm uppercase tracking-widest">
                                Street
                            </label>

                            <input
                                name="street"
                                type="text"
                                className="input input-bordered w-full rounded-none bg-[#0f0f0f] border-2 border-zinc-800 focus:border-second outline-0"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm uppercase tracking-widest">
                                House / Apartment
                            </label>

                            <input
                                name="house"
                                type="text"
                                className="input input-bordered w-full rounded-none bg-[#0f0f0f] border-2 border-zinc-800 focus:border-second outline-0"
                            />
                        </div>

                    </div>

                    {/* City + Postal */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        <div>
                            <label className="mb-2 block text-sm uppercase tracking-widest">
                                City
                            </label>

                            <input
                                name="city"
                                type="text"
                                className="input input-bordered w-full rounded-none bg-[#0f0f0f] border-2 border-zinc-800 focus:border-second outline-0"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm uppercase tracking-widest">
                                Postal Code
                            </label>

                            <input
                                name="zipCode"
                                type="text"
                                className="input input-bordered w-full rounded-none bg-[#0f0f0f] border-2 border-zinc-800 focus:border-second outline-0"
                            />
                        </div>

                    </div>

                    {/* Country + Phone */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">


                        <div>
                            <label className="label label-text text-xs text-gray-400 uppercase">
                                Country
                            </label>

                            <select
                                value={selectedCountry.value}
                                onChange={(e) =>
                                    setSelectedCountry(
                                        Countries.find(
                                            (country) => country.value === e.target.value
                                        ) || Countries[0]
                                    )
                                }
                                className="select w-full bg-[#0f0f0f] border border-gray-900 rounded-none focus:outline-none focus:border-second text-sm"
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

                        <div>
                            <label className="label label-text text-xs text-gray-400 uppercase">
                                Phone Number <span className="text-[10px] tracking-wider">(without country code)</span>
                            </label>

                            <div className="flex w-full">
                                <div className="flex items-center px-3 bg-black border border-r-0 border-gray-900 text-sm text-second">
                                    {selectedCountryCode}
                                </div>

                                <input
                                    name="phone"
                                    type="tel" 
                                    placeholder="PHONE NUMBER"
                                    required
                                    className="input flex-1 bg-black border border-gray-900 rounded-none focus:outline-none focus:border-second text-sm tracking-wide placeholder:text-zinc-600"
                                />
                            </div>
                        </div>

                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-5 pt-6">
                        <button
                            type="button"
                            onClick={onCloseAction}
                            className="btn btn-md bg-transparent hover:bg-zinc-800 border-0 shadow-none rounded-none uppercase"
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className='light:text-white text-black group relative flex btn btn-md bg-second font-bold shadow-none border-0 rounded-none hover:shadow-[0_0_20px_rgba(163,230,53,0.8)] transition-all duration-300 hover:scale-105'>

                            <span className={` flex items-center gap-2`}>
                                <Save size={16} strokeWidth={2} />
                                SAVE
                            </span>
                        </button>

                    </div>

                </form>

            </div>

            {/* Backdrop */}
            <form method="dialog" className="modal-backdrop">
                <button onClick={onCloseAction}>close</button>
            </form>
        </dialog>
    );
}