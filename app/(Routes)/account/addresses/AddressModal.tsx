"use client"; 
import { X, Save } from "lucide-react";

type AddressModalProps = {
    open: boolean;
    onCloseAction: () => void;
};

export default function AddressModal({
    open,
    onCloseAction,
}: AddressModalProps) {
    if (!open) return null;

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-3xl rounded-none border border-base-300 bg-base-100 p-8 shadow-xl">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="font-mono text-3xl font-bold uppercase tracking-widest">
                        New Drop Location
                    </h2>

                    <button
                        onClick={onCloseAction}
                        className="btn btn-ghost btn-square btn-sm"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form className="space-y-6">

                    {/* Label */}
                    <div>
                        <label className="mb-2 block font-mono text-sm uppercase tracking-widest">
                            Label
                        </label>

                        <input
                            type="text"
                            placeholder="HOME / OFFICE"
                            className="input input-bordered w-full rounded-none bg-base-100 uppercase focus:border-primary focus:outline-none"
                        />
                    </div>

                    {/* Full Name */}
                    <div>
                        <label className="mb-2 block font-mono text-sm uppercase tracking-widest">
                            Full Name
                        </label>

                        <input
                            type="text"
                            className="input input-bordered w-full rounded-none bg-base-100 focus:border-primary"
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="mb-2 block font-mono text-sm uppercase tracking-widest">
                            Address
                        </label>

                        <textarea
                            rows={3}
                            className="textarea textarea-bordered w-full rounded-none bg-base-100 focus:border-primary"
                        />
                    </div>

                    {/* City + Postal */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        <div>
                            <label className="mb-2 block font-mono text-sm uppercase tracking-widest">
                                City
                            </label>

                            <input
                                type="text"
                                className="input input-bordered w-full rounded-none bg-base-100"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block font-mono text-sm uppercase tracking-widest">
                                Postal Code
                            </label>

                            <input
                                type="text"
                                className="input input-bordered w-full rounded-none bg-base-100"
                            />
                        </div>

                    </div>

                    {/* Country + Phone */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        <div>
                            <label className="mb-2 block font-mono text-sm uppercase tracking-widest">
                                Country
                            </label>

                            <input
                                value="Japan"
                                readOnly
                                className="input input-bordered w-full rounded-none bg-base-100"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block font-mono text-sm uppercase tracking-widest">
                                Phone Number
                            </label>

                            <input
                                type="tel"
                                placeholder="+81 123456789"
                                className="input input-bordered w-full rounded-none bg-base-100"
                            />
                        </div>

                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-5 pt-6">

                        <button
                            type="button"
                            onClick={onCloseAction}
                            className="btn btn-ghost rounded-none uppercase"
                        >
                            Cancel
                        </button>

                        <button
                            className="btn btn-primary rounded-none uppercase"
                        >
                            <Save size={16} />
                            Save
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