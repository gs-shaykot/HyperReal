"use client";

import { useEffect, useState } from "react";
import { X, Globe, RefreshCw } from "lucide-react";
import type { OperationalCountry } from "@/app/Hooks/useAdminSettings";

export type CountryForm = {
    name: string;
    code: string;
    phoneCode: string;
    currencyCode: string;
    currencySymbol: string;
    shippingFeeUSD: number;
    freeShippingThresholdUSD: number;
    isActive: boolean;
};

type CountryOption = {
    name: string;
    code: string;
    phoneCode: string;
    currencyCode: string;
    currencySymbol: string;
};

const supportedCountries: CountryOption[] = [
    { name: "Bangladesh", code: "BD", phoneCode: "+880", currencyCode: "BDT", currencySymbol: "৳" },
    { name: "United States", code: "US", phoneCode: "+1", currencyCode: "USD", currencySymbol: "$" },
    { name: "United Kingdom", code: "GB", phoneCode: "+44", currencyCode: "GBP", currencySymbol: "£" },
    { name: "Germany", code: "DE", phoneCode: "+49", currencyCode: "EUR", currencySymbol: "€" },
    { name: "Japan", code: "JP", phoneCode: "+81", currencyCode: "JPY", currencySymbol: "¥" },
    { name: "Australia", code: "AU", phoneCode: "+61", currencyCode: "AUD", currencySymbol: "A$" },
    { name: "Canada", code: "CA", phoneCode: "+1", currencyCode: "CAD", currencySymbol: "C$" },
    { name: "India", code: "IN", phoneCode: "+91", currencyCode: "INR", currencySymbol: "₹" },
];

const emptyForm: CountryForm = {
    name: "",
    code: "",
    phoneCode: "",
    currencyCode: "",
    currencySymbol: "",
    shippingFeeUSD: 10,
    freeShippingThresholdUSD: 100,
    isActive: true,
};

const inputClass =
    "w-full border border-white/15 bg-black/30 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-second";

const labelClass =
    "mb-1.5 block font-mono text-[10px] tracking-wider text-white/60";

type Props = {
    open: boolean;
    country?: OperationalCountry | null;
    existingCountries: OperationalCountry[];
    isPending: boolean;
    onCloseAction: () => void;
    onCreate: (form: CountryForm & { id?: string }) => void;
};

export function CountryModal({
    open,
    country,
    existingCountries,
    isPending,
    onCloseAction,
    onCreate,
}: Props) {
    const [form, setForm] = useState<CountryForm>(emptyForm);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!open) return;

        if (country) {
            setForm({
                name: country.name,
                code: country.code,
                phoneCode: country.phoneCode,
                currencyCode: country.currencyCode,
                currencySymbol: country.currencySymbol,
                shippingFeeUSD: country.shippingFeeUSD,
                freeShippingThresholdUSD: country.freeShippingThresholdUSD,
                isActive: country.isActive,
            });
        } else {
            setForm(emptyForm);
        }

        setSearch("");
    }, [open, country]);

    if (!open) return null;

    const availableCountries = supportedCountries.filter(
        (option) =>
            !existingCountries.some(
                (existing) =>
                    existing.code === option.code &&
                    existing.id !== country?.id
            ) &&
            option.name.toLowerCase().includes(search.toLowerCase())
    );

    const update = (values: Partial<CountryForm>) =>
        setForm((current) => ({ ...current, ...values }));

    const chooseCountry = (code: string) => {
        const option = supportedCountries.find((item) => item.code === code);
        if (!option) return;

        update({
            name: option.name,
            code: option.code,
            phoneCode: option.phoneCode,
            currencyCode: option.currencyCode,
            currencySymbol: option.currencySymbol,
        });
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (
            !form.code ||
            !Number.isFinite(form.shippingFeeUSD) ||
            !Number.isFinite(form.freeShippingThresholdUSD) ||
            form.shippingFeeUSD < 0 ||
            form.freeShippingThresholdUSD < 0
        ) {
            return;
        }

        onCreate({
            ...form,
            ...(country ? { id: country.id } : {}),
        });
    };

    return (
        <dialog className="modal modal-open z-50">
            <div className="modal-box max-h-[90vh] overflow-y-auto rounded-none border border-white/15 bg-[#0b0f12] p-5 text-white">
                <header className="mb-5 flex items-start justify-between border-b border-white/10 pb-4">
                    <div>
                        <h2 className="flex items-center gap-2 font-mono text-sm font-bold">
                            <Globe className="size-4" />
                            {country ? "EDIT COUNTRY" : "ADD COUNTRY"}
                        </h2>
                        <p className="mt-1 text-xs text-white/50">
                            Configure shipping destination settings.
                        </p>
                    </div>

                    <button type="button" onClick={onCloseAction}>
                        <X className="size-4" />
                    </button>
                </header>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className={labelClass}>COUNTRY *</label>

                        {country ? (
                            <input
                                className={inputClass}
                                value={form.name}
                                readOnly
                            />
                        ) : (
                            <>
                                <input
                                    className={`${inputClass} mb-2`}
                                    placeholder="Search countries..."
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                />

                                <select
                                    className={inputClass}
                                    value={form.code}
                                    onChange={(event) => chooseCountry(event.target.value)}
                                    required
                                >
                                    <option value="">Select a country...</option>
                                    {availableCountries.map((option) => (
                                        <option key={option.code} value={option.code}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <label>
                            <span className={labelClass}>COUNTRY CODE</span>
                            <input className={inputClass} value={form.code} readOnly />
                        </label>

                        <label>
                            <span className={labelClass}>CURRENCY</span>
                            <input
                                className={inputClass}
                                value={form.currencyCode}
                                readOnly
                            />
                        </label>

                        <label>
                            <span className={labelClass}>SYMBOL</span>
                            <input
                                className={inputClass}
                                value={form.currencySymbol}
                                readOnly
                            />
                        </label>
                    </div>

                    <label className="block">
                        <span className={labelClass}>EXCHANGE RATE (1 USD = ?)</span>
                        <div className="flex gap-2">
                            <input
                                className={inputClass}
                                value="Fetched from exchange-rate service"
                                readOnly
                            />
                            <button
                                type="button"
                                title="Refresh exchange rate"
                                className="border border-white/15 px-3"
                                onClick={() => window.dispatchEvent(
                                    new Event("hyperreal-refresh-exchange-rates")
                                )}
                            >
                                <RefreshCw className="size-4" />
                            </button>
                        </div>
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                        <label>
                            <span className={labelClass}>SHIPPING FEE (USD) *</span>
                            <input
                                type="number"
                                min={0}
                                step="0.01"
                                required
                                className={inputClass}
                                value={form.shippingFeeUSD}
                                onChange={(event) =>
                                    update({ shippingFeeUSD: Number(event.target.value) })
                                }
                            />
                        </label>

                        <label>
                            <span className={labelClass}>FREE SHIPPING (USD) *</span>
                            <input
                                type="number"
                                min={0}
                                step="0.01"
                                required
                                className={inputClass}
                                value={form.freeShippingThresholdUSD}
                                onChange={(event) =>
                                    update({
                                        freeShippingThresholdUSD: Number(event.target.value),
                                    })
                                }
                            />
                        </label>
                    </div>

                    <label className="flex items-center gap-3 font-mono text-xs">
                        <input
                            type="checkbox"
                            className="toggle toggle-success"
                            checked={form.isActive}
                            onChange={(event) =>
                                update({ isActive: event.target.checked })
                            }
                        />
                        ACTIVE — AVAILABLE AT CHECKOUT
                    </label>

                    <footer className="flex gap-3 border-t border-white/10 pt-4">
                        <button
                            type="button"
                            onClick={onCloseAction}
                            className="flex-1 border border-white/20 py-3 font-mono text-xs"
                        >
                            CANCEL
                        </button>

                        <button
                            type="submit"
                            disabled={isPending || (!country && !form.code)}
                            className="flex-1 bg-second py-3 font-mono text-xs font-bold text-black disabled:opacity-50"
                        >
                            {isPending ? "SAVING..." : country ? "SAVE COUNTRY" : "ADD COUNTRY"}
                        </button>
                    </footer>
                </form>
            </div>

            <form method="dialog" className="modal-backdrop">
                <button type="button" onClick={onCloseAction}>close</button>
            </form>
        </dialog>
    );
}