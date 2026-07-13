"use client";
import { useAddress } from "@/app/Hooks/useAddress";
import { getAddresses } from "@/lib/addressApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { on } from "events";
import { X, Save } from "lucide-react";

type AddressModalProps = {
    open: boolean;
    onCloseAction: () => void;
};

export default function AddressModal({
    open,
    onCloseAction,
}: AddressModalProps) {
    const addressMutation = useAddress();

    const { data: addresses, isLoading } = useQuery({
        queryKey: ["address"],
        queryFn: getAddresses
    });
    if (!open) return null;

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
        console.log("Form data submitted: ", data);
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
                            <label className="mb-2 block text-sm uppercase tracking-widest">
                                Country
                            </label>

                            <input
                                name="country"
                                value="Bangladesh"
                                readOnly
                                className="input input-bordered w-full rounded-none bg-[#0f0f0f] border-2 border-zinc-800 focus:border-second outline-0"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm uppercase tracking-widest">
                                Phone Number
                            </label>

                            <input
                                name="phone"
                                type="tel"
                                placeholder="+81 123456789"
                                className="input input-bordered w-full rounded-none bg-[#0f0f0f] border-2 border-zinc-800 focus:border-second outline-0"
                            />
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