import { CalendarDays, Check, X } from 'lucide-react'
import React, { useState } from 'react'

// WHY THE FLAT DISCOUNT BUTTON IS NOT WORKING ?

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

const initialForm: CouponForm = {
    code: "",
    value: "20",
    minSpend: "0",
    limit: "100",
    expiryDate: "",
    type: "percent",
    maxDiscount: "",
    newUserOnly: false,
};

type AddressModalProps = {
    open: boolean;
    onCloseAction: () => void;
    onCreate: (form: CouponForm) => void;
    isPending: boolean;
};

export const AddCouponModal = ({ open, onCloseAction, onCreate, isPending }: AddressModalProps) => {
    const [form, setForm] = useState<CouponForm>(initialForm);

    const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        onCreate(form);
    };

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

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block font-mono text-[10px] tracking-widest text-zinc-400">
                            COUPON CODE *
                        </label>
                        <input
                            value={form.code}
                            onChange={(event) =>
                                setForm({ ...form, code: event.target.value })
                            }
                            placeholder="e.g. SUMMER20"
                            className="h-10 w-full border border-zinc-800 uppercase bg-black px-3 font-mono text-xs text-white light:border-zinc-300 light:bg-white light:text-zinc-900"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block font-mono text-[10px] tracking-widest text-zinc-400">
                            DISCOUNT VALUE *
                        </label>
                        <input
                            type="number"
                            value={form.value}
                            onChange={(event) =>
                                setForm({ ...form, value: event.target.value })
                            }
                            className="h-10 w-full border border-zinc-800 bg-black px-3 font-mono text-xs text-white light:border-zinc-300 light:bg-white light:text-zinc-900"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block font-mono text-[10px] tracking-widest text-zinc-400">
                            MIN. ORDER ($)
                        </label>
                        <input
                            type="number"
                            value={form.minSpend}
                            onChange={(event) =>
                                setForm({ ...form, minSpend: event.target.value })
                            }
                            placeholder="No minimum"
                            className="h-10 w-full border border-zinc-800 bg-black px-3 font-mono text-xs text-white light:border-zinc-300 light:bg-white light:text-zinc-900"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block font-mono text-[10px] tracking-widest text-zinc-400">
                            MAX. DISCOUNT ($) — OPTIONAL
                        </label>
                        <input
                            type="number"
                            value={form.maxDiscount}
                            onChange={(event) =>
                                setForm({ ...form, maxDiscount: event.target.value })
                            }
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
                            value={form.limit}
                            onChange={(event) =>
                                setForm({ ...form, limit: event.target.value })
                            }
                            placeholder="No limit"
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
                                value={form.expiryDate}
                                onChange={(event) =>
                                    setForm({ ...form, expiryDate: event.target.value })
                                }
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
                                onClick={() =>
                                    setForm((prev) => ({ ...prev, type: "percent" }))
                                }
                                className={`h-9 border font-mono text-[10px] font-bold tracking-widest transition-all cursor-pointer ${form.type === "percent"
                                        ? "border-second bg-second text-black"
                                        : "border-zinc-800 text-zinc-400"
                                    }`}
                            >
                                % PERCENT
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setForm((prev) => ({ ...prev, type: "flat" }))
                                }
                                className={`h-9 border font-mono text-[10px] font-bold tracking-widest transition-all cursor-pointer ${form.type === "flat"
                                        ? "border-second bg-second text-black"
                                        : "border-zinc-800 text-zinc-400"
                                    }`}
                            >
                                $ FIXED
                            </button>
                        </div>
                    </div> 

                    <label className="flex items-center gap-2 font-mono text-[10px] text-zinc-400">
                        <input type="checkbox"
                            checked={form.newUserOnly}
                            onChange={(event) =>
                                setForm({ ...form, newUserOnly: event.target.checked })
                            }
                            className="accent-lime-400" />
                        NEW USERS ONLY
                    </label>

                    <div className="flex gap-3 pt-1">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="inline-flex h-9 flex-1 items-center justify-center gap-2 bg-second font-mono text-[10px] font-bold tracking-widest text-black disabled:opacity-50 cursor-pointer"
                        >
                            <Check className="size-4" />
                            {isPending ? "CREATING..." : "CREATE COUPON"}
                        </button>

                        <button
                            type="button"
                            onClick={onCloseAction}
                            disabled={isPending}
                            className="h-9 border border-zinc-800 px-5 font-mono text-[10px] font-bold tracking-widest text-white light:text-zinc-900 cursor-pointer"
                        >
                            CANCEL
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    )
}
