
"use client";

import { useEffect, useState } from "react";
import { Globe, RefreshCw, X } from "lucide-react";
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

type CountryOption = Omit<
    CountryForm,
    "shippingFeeUSD" | "freeShippingThresholdUSD" | "isActive"
>;

type Props = {
    open: boolean;
    country: OperationalCountry | null;
    existingCountries: OperationalCountry[];
    exchangeRates: Record<string, number>;
    isPending: boolean;
    onCloseAction: () => void;
    onSubmitAction: (form: CountryForm) => void;
    onRefreshRatesAction: () => void;
    isRefreshingRates: boolean;
};

const countryOptions: CountryOption[] = [
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
    "w-full border border-white/20 bg-black/30 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-second";

const labelClass =
    "mb-1.5 block font-mono text-[10px] font-bold tracking-wider text-white/60";

export default function CountryModal({
    open,
    country,
    existingCountries,
    exchangeRates,
    isPending,
    onCloseAction,
    onSubmitAction,
    onRefreshRatesAction,
    isRefreshingRates,
}: Props) {
    const [form, setForm] = useState<CountryForm>(emptyForm);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!open) return;

        if (country) {
            setForm({
                name: country.name,
                code: country.code,
                phoneCode: country.phoneCode ?? "",
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

    const availableCountries = countryOptions.filter((option) => {
        const alreadyExists = existingCountries.some(
            (item) => item.code === option.code && item.id !== country?.id
        );

        return (
            !alreadyExists &&
            option.name.toLowerCase().includes(search.toLowerCase())
        );
    });

    const rate = exchangeRates[form.currencyCode];

    const updateForm = (values: Partial<CountryForm>) => {
        setForm((current) => ({ ...current, ...values }));
    };

    const selectCountry = (code: string) => {
        const selected = countryOptions.find((item) => item.code === code);
        if (!selected) return;

        updateForm({
            name: selected.name,
            code: selected.code,
            phoneCode: selected.phoneCode,
            currencyCode: selected.currencyCode,
            currencySymbol: selected.currencySymbol,
        });
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (
            !form.name ||
            !form.code ||
            !form.phoneCode ||
            !form.currencyCode ||
            !form.currencySymbol ||
            !Number.isFinite(form.shippingFeeUSD) ||
            !Number.isFinite(form.freeShippingThresholdUSD) ||
            form.shippingFeeUSD < 0 ||
            form.freeShippingThresholdUSD < 0
        ) {
            return;
        }

        onSubmitAction(form);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onCloseAction();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="country-modal-title"
                className="my-auto max-h-[95vh] w-full max-w-lg overflow-y-auto border border-white/20 bg-[#0b0f12] p-5 text-white shadow-2xl"
            >
                <header className="mb-5 flex items-start justify-between border-b border-white/10 pb-4">
                    <div>
                        <h2
                            id="country-modal-title"
                            className="flex items-center gap-2 font-mono text-sm font-bold"
                        >
                            <Globe className="size-4" />
                            {country ? "EDIT COUNTRY" : "ADD COUNTRY"}
                        </h2>
                        <p className="mt-1 text-xs text-white/50">
                            Configure a shipping destination.
                        </p>
                    </div>

                    <button type="button" onClick={onCloseAction} aria-label="Close">
                        <X className="size-4" />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                                    onChange={(event) => selectCountry(event.target.value)}
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

                    <div className="grid grid-cols-3 gap-2">
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
                        <span className={labelClass}>
                            EXCHANGE RATE (1 USD = ?)
                        </span>

                        <div className="flex gap-2">
                            <input
                                className={inputClass}
                                value={
                                    rate == null
                                        ? form.code
                                            ? "Rate unavailable"
                                            : "Select a country first"
                                        : `1 USD = ${rate} ${form.currencyCode}`
                                }
                                readOnly
                            />

                            <button
                                type="button"
                                onClick={onRefreshRatesAction}
                                disabled={isRefreshingRates}
                                title="Refresh exchange rates"
                                className="border border-white/20 px-3 disabled:opacity-50"
                            >
                                <RefreshCw
                                    className={`size-4 ${isRefreshingRates ? "animate-spin" : ""}`}
                                />
                            </button>
                        </div>

                        <span className="mt-1 block text-[10px] text-white/40">
                            Estimate for display only. Checkout remains in USD.
                        </span>
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                        <label>
                            <span className={labelClass}>SHIPPING FEE (USD) *</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                className={inputClass}
                                value={form.shippingFeeUSD}
                                onChange={(event) =>
                                    updateForm({
                                        shippingFeeUSD: Number(event.target.value),
                                    })
                                }
                            />
                        </label>

                        <label>
                            <span className={labelClass}>
                                FREE SHIPPING (USD) *
                            </span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                className={inputClass}
                                value={form.freeShippingThresholdUSD}
                                onChange={(event) =>
                                    updateForm({
                                        freeShippingThresholdUSD: Number(
                                            event.target.value
                                        ),
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
                                updateForm({ isActive: event.target.checked })
                            }
                        />
                        ACTIVE — AVAILABLE AT CHECKOUT
                    </label>

                    <footer className="flex gap-3 border-t border-white/10 pt-4">
                        <button
                            type="button"
                            onClick={onCloseAction}
                            className="flex-1 border border-white/20 py-3 font-mono text-xs font-bold"
                        >
                            CANCEL
                        </button>

                        <button
                            type="submit"
                            disabled={isPending || !form.code}
                            className="flex-1 bg-second py-3 font-mono text-xs font-bold text-black disabled:opacity-50"
                        >
                            {isPending
                                ? "SAVING..."
                                : country
                                    ? "SAVE COUNTRY"
                                    : "ADD COUNTRY"}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}
