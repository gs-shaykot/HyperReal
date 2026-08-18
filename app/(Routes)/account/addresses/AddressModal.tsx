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
        name: 'Bangladesh',
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
    const selectedCountryCode = Countries.find(country => country.name === selectedCountry.name)?.countryCode ?? "";

    const handleSubmit = (formData: FormData) => {
        const phoneInput = formData.get("phone")?.toString().trim() || "";
        const cleanedPhone = phoneInput.replace(/[^\d]/g, "");
        const nationalPhone = cleanedPhone.replace(/^0+/, "");
        const fullPhoneNumber = `${selectedCountryCode}${nationalPhone}`;

        const data = {
            label: formData.get("label")?.toString().trim() || "Home",
            fullName: formData.get("fullName")?.toString().trim() || "",
            street: formData.get("street")?.toString().trim() || "",
            house: formData.get("house")?.toString().trim() || "",
            city: formData.get("city")?.toString().trim() || "",
            zipCode: formData.get("zipCode")?.toString().trim() || "",
            country: selectedCountry.name,
            phone: fullPhoneNumber
        };
        addressMutation.mutate(data);
        if (!isLoading) {
            onCloseAction();
        }
    }

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-xl rounded-none border border-base-300 bg-main light:bg-white p-8 shadow-xl text-white light:text-zinc-900">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-2xl font-bold uppercase tracking-widest light:text-zinc-900 text-white">
                        New Drop Location
                    </h2>

                    <button
                        onClick={onCloseAction}
                        className="btn btn-ghost btn-square btn-sm light:text-zinc-800 text-white hover:bg-zinc-800 light:hover:bg-zinc-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form action={handleSubmit} className="space-y-6">
                    {/* Label */}
                    <div>
                        <label className="mb-2 block text-sm uppercase tracking-widest light:text-zinc-700 text-zinc-300">
                            Label
                        </label>

                        <input
                            name="label"
                            type="text"
                            placeholder="HOME / OFFICE"
                            className="input input-bordered w-full rounded-none bg-[#0f0f0f] light:bg-white border-2 border-zinc-800 light:border-zinc-300 focus:border-second outline-0 uppercase focus:outline-none light:text-zinc-900 text-white placeholder:text-zinc-500 light:placeholder:text-zinc-400"
                        />
                    </div>

                    {/* Full Name */}
                    <div>
                        <label className="mb-2 block text-sm uppercase tracking-widest light:text-zinc-700 text-zinc-300">
                            Full Name
                        </label>

                        <input
                            name="fullName"
                            type="text"
                            className="input input-bordered w-full rounded-none bg-[#0f0f0f] light:bg-white border-2 border-zinc-800 light:border-zinc-300 focus:border-second outline-0 light:text-zinc-900 text-white placeholder:text-zinc-500 light:placeholder:text-zinc-400"
                        />
                    </div>

                    {/* Address */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        <div>
                            <label className="mb-2 block text-sm uppercase tracking-widest light:text-zinc-700 text-zinc-300">
                                Street
                            </label>

                            <input
                                name="street"
                                type="text"
                                className="input input-bordered w-full rounded-none bg-[#0f0f0f] light:bg-white border-2 border-zinc-800 light:border-zinc-300 focus:border-second outline-0 light:text-zinc-900 text-white placeholder:text-zinc-500 light:placeholder:text-zinc-400"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm uppercase tracking-widest light:text-zinc-700 text-zinc-300">
                                House / Apartment
                            </label>

                            <input
                                name="house"
                                type="text"
                                className="input input-bordered w-full rounded-none bg-[#0f0f0f] light:bg-white border-2 border-zinc-800 light:border-zinc-300 focus:border-second outline-0 light:text-zinc-900 text-white placeholder:text-zinc-500 light:placeholder:text-zinc-400"
                            />
                        </div>

                    </div>

                    {/* City + Postal */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        <div>
                            <label className="mb-2 block text-sm uppercase tracking-widest light:text-zinc-700 text-zinc-300">
                                City
                            </label>

                            <input
                                name="city"
                                type="text"
                                className="input input-bordered w-full rounded-none bg-[#0f0f0f] light:bg-white border-2 border-zinc-800 light:border-zinc-300 focus:border-second outline-0 light:text-zinc-900 text-white placeholder:text-zinc-500 light:placeholder:text-zinc-400"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm uppercase tracking-widest light:text-zinc-700 text-zinc-300">
                                Postal Code
                            </label>

                            <input
                                name="zipCode"
                                type="text"
                                className="input input-bordered w-full rounded-none bg-[#0f0f0f] light:bg-white border-2 border-zinc-800 light:border-zinc-300 focus:border-second outline-0 light:text-zinc-900 text-white placeholder:text-zinc-500 light:placeholder:text-zinc-400"
                            />
                        </div>

                    </div>

                    {/* Country + Phone */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">


                        <div>
                            <label className="label label-text text-xs text-gray-400 light:text-gray-700 uppercase">
                                Country
                            </label>

                            <select
                                value={selectedCountry.name}
                                onChange={(e) =>
                                    setSelectedCountry(
                                        Countries.find(
                                            (country) => country.name === e.target.value
                                        ) || Countries[0]
                                    )
                                }
                                className="select w-full bg-[#0f0f0f] light:bg-white border border-gray-900 light:border-zinc-300 rounded-none focus:outline-none focus:border-second text-sm light:text-zinc-900 text-white"
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
                            <label className="label label-text text-xs text-gray-400 light:text-gray-700 uppercase">
                                Phone Number <span className="text-[10px] tracking-wider">(without country code)</span>
                            </label>

                            <div className="flex w-full">
                                <div className="flex items-center px-3 bg-black light:bg-zinc-100 border border-r-0 border-gray-900 light:border-zinc-300 text-sm text-second">
                                    {selectedCountryCode}
                                </div>

                                <input
                                    name="phone"
                                    type="tel"
                                    placeholder="PHONE NUMBER"
                                    required
                                    className="input flex-1 bg-black light:bg-white border border-gray-900 light:border-zinc-300 rounded-none focus:outline-none focus:border-second text-sm tracking-wide placeholder:text-zinc-600 light:placeholder:text-zinc-500 light:text-zinc-900 text-white"
                                />
                            </div>
                        </div>

                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-5 pt-6">
                        <button
                            type="button"
                            onClick={onCloseAction}
                            className="btn btn-md bg-transparent light:hover:bg-zinc-100 hover:bg-zinc-800 border-0 shadow-none rounded-none uppercase light:text-zinc-900 text-white"
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