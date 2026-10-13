import { CalendarDays, Check, X } from 'lucide-react'
import React from 'react'

const initialForm = {
    code: "",
    value: "20",
    minSpend: "0",
    limit: "100",
    expiryDate: "",
    type: "percent",
    maxDiscount: "",
    newUserOnly: false,
};

export type CouponForm = {
    code: string;
    value: string;
    minSpend: string;
    limit: string;
    expiryDate: string;
    type: "percent" | "flat";
    maxDiscount: string;
    newUserOnly: boolean;
};

type AddressModalProps = {
    open: boolean;
    onCloseAction: () => void;
};

export const AddCouponModal = ({ open, onCloseAction }: AddressModalProps) => {
    if (!open) return null;
    return (
        <dialog className="modal modal-open">
            <div className="modal-box rounded-none bg-main mt-8 border border-zinc-800 p-5 light:border-zinc-200">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="font-mono text-xs font-bold tracking-widest text-white light:text-zinc-900">
                        CREATE COUPON — FORM UI
                    </h2>

                    <X onClick={onCloseAction} className="size-4 text-zinc-400 cursor-pointer" />
                </div>

                <form className="space-y-4">
                    <div>
                        <label className="mb-1.5 block font-mono text-[10px] tracking-widest text-zinc-400">
                            COUPON CODE *
                        </label>
                        <input
                            defaultValue={initialForm.code}
                            placeholder="e.g. SUMMER20"
                            className="h-10 w-full border border-zinc-800 bg-black px-3 font-mono text-xs text-white light:border-zinc-300 light:bg-white light:text-zinc-900"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block font-mono text-[10px] tracking-widest text-zinc-400">
                            DISCOUNT VALUE *
                        </label>
                        <input
                            type="number"
                            defaultValue={initialForm.value}
                            className="h-10 w-full border border-zinc-800 bg-black px-3 font-mono text-xs text-white light:border-zinc-300 light:bg-white light:text-zinc-900"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block font-mono text-[10px] tracking-widest text-zinc-400">
                            MIN. ORDER ($)
                        </label>
                        <input
                            type="number"
                            defaultValue={initialForm.minSpend}
                            className="h-10 w-full border border-zinc-800 bg-black px-3 font-mono text-xs text-white light:border-zinc-300 light:bg-white light:text-zinc-900"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block font-mono text-[10px] tracking-widest text-zinc-400">
                            MAX. DISCOUNT ($) — OPTIONAL
                        </label>
                        <input
                            type="number"
                            defaultValue={initialForm.maxDiscount}
                            placeholder="No maximum"
                            className="h-10 w-full border border-zinc-800 bg-black px-3 font-mono text-xs text-white light:border-zinc-300 light:bg-white light:text-zinc-900"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block font-mono text-[10px] tracking-widest text-zinc-400">
                            USAGE LIMIT
                        </label>
                        <input
                            type="number"
                            defaultValue={initialForm.limit}
                            className="h-10 w-full border border-zinc-800 bg-black px-3 font-mono text-xs text-white light:border-zinc-300 light:bg-white light:text-zinc-900"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block font-mono text-[10px] tracking-widest text-zinc-400">
                            EXPIRES AT — OPTIONAL
                        </label>

                        <div className="relative">
                            <CalendarDays className="pointer-events-none absolute right-3 top-3 size-4 text-zinc-500" />
                            <input
                                type="date"
                                className="h-10 w-full border border-zinc-800 bg-black px-3 pr-10 font-mono text-xs text-white light:border-zinc-300 light:bg-white light:text-zinc-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block font-mono text-[10px] tracking-widest text-zinc-400">
                            DISCOUNT TYPE
                        </label>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                className="h-9 border border-second bg-second font-mono text-[10px] font-bold tracking-widest text-black"
                            >
                                % PERCENT
                            </button>

                            <button
                                type="button"
                                className="h-9 border border-zinc-800 font-mono text-[10px] font-bold tracking-widest text-zinc-400"
                            >
                                $ FIXED
                            </button>
                        </div>
                    </div>

                    <label className="flex items-center gap-2 font-mono text-[10px] text-zinc-400">
                        <input type="checkbox" className="accent-lime-400" />
                        NEW USERS ONLY
                    </label>

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            className="inline-flex h-9 flex-1 items-center justify-center gap-2 bg-second font-mono text-[10px] font-bold tracking-widest text-black"
                        >
                            <Check className="size-4" />
                            CREATE COUPON
                        </button>

                        <button
                            type="button"
                            className="h-9 border border-zinc-800 px-5 font-mono text-[10px] font-bold tracking-widest text-white light:text-zinc-900"
                        >
                            CANCEL
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    )
}
