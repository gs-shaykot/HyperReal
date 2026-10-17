
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type {
    CountryInput,
    OperationalCountry,
} from "@/app/Hooks/useAdminCountries";

type CountryOption = {
    name: string;
    code: string;
    phoneCode: string;
    currencyCode: string;
    currencySymbol: string;
};

const COUNTRY_OPTIONS: CountryOption[] = [
    { name: "Australia", code: "AU", phoneCode: "+61", currencyCode: "AUD", currencySymbol: "A$" },
    { name: "Bangladesh", code: "BD", phoneCode: "+880", currencyCode: "BDT", currencySymbol: "৳" },
    { name: "Brazil", code: "BR", phoneCode: "+55", currencyCode: "BRL", currencySymbol: "R$" },
    { name: "Canada", code: "CA", phoneCode: "+1", currencyCode: "CAD", currencySymbol: "C$" },
    { name: "China", code: "CN", phoneCode: "+86", currencyCode: "CNY", currencySymbol: "¥" },
    { name: "Denmark", code: "DK", phoneCode: "+45", currencyCode: "DKK", currencySymbol: "kr" },
    { name: "France", code: "FR", phoneCode: "+33", currencyCode: "EUR", currencySymbol: "€" },
    { name: "Germany", code: "DE", phoneCode: "+49", currencyCode: "EUR", currencySymbol: "€" },
    { name: "India", code: "IN", phoneCode: "+91", currencyCode: "INR", currencySymbol: "₹" },
    { name: "Indonesia", code: "ID", phoneCode: "+62", currencyCode: "IDR", currencySymbol: "Rp" },
    { name: "Italy", code: "IT", phoneCode: "+39", currencyCode: "EUR", currencySymbol: "€" },
    { name: "Japan", code: "JP", phoneCode: "+81", currencyCode: "JPY", currencySymbol: "¥" },
    { name: "Malaysia", code: "MY", phoneCode: "+60", currencyCode: "MYR", currencySymbol: "RM" },
    { name: "Netherlands", code: "NL", phoneCode: "+31", currencyCode: "EUR", currencySymbol: "€" },
    { name: "New Zealand", code: "NZ", phoneCode: "+64", currencyCode: "NZD", currencySymbol: "NZ$" },
    { name: "Pakistan", code: "PK", phoneCode: "+92", currencyCode: "PKR", currencySymbol: "₨" },
    { name: "Saudi Arabia", code: "SA", phoneCode: "+966", currencyCode: "SAR", currencySymbol: "﷼" },
    { name: "Singapore", code: "SG", phoneCode: "+65", currencyCode: "SGD", currencySymbol: "S$" },
    { name: "United Kingdom", code: "GB", phoneCode: "+44", currencyCode: "GBP", currencySymbol: "£" },
    { name: "United States", code: "US", phoneCode: "+1", currencyCode: "USD", currencySymbol: "$" },
];

type Props = {
    open: boolean;
    country: OperationalCountry | null;
    existingCodes: string[];
    onCloseAction: () => void;
    onSaveAction: (data: CountryInput) => void;
    isSaving: boolean;
};

const emptyForm: CountryInput = {
    name: "",
    code: "",
    phoneCode: "",
    currencyCode: "",
    currencySymbol: "",
    shippingFeeUSD: 15,
    freeShippingThresholdUSD: 150,
    isActive: true,
};

const inputClass =
    "h-10 w-full border border-[#303030] bg-[#101010] px-3 text-sm text-white outline-none focus:border-[#c8ff00]";

const labelClass =
    "mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-zinc-400";

export default function CountryModal({
    open,
    country,
    existingCodes,
    onCloseAction,
    onSaveAction,
    isSaving,
}: Props) {
    const [form, setForm] = useState<CountryInput>(emptyForm);
    const [search, setSearch] = useState("");
    const [showOptions, setShowOptions] = useState(false);

    useEffect(() => {
        if (!open) return;

        setForm(
            country
                ? {
                      id: country.id,
                      name: country.name,
                      code: country.code,
                      phoneCode: country.phoneCode,
                      currencyCode: country.currencyCode,
                      currencySymbol: country.currencySymbol,
                      shippingFeeUSD: country.shippingFeeUSD,
                      freeShippingThresholdUSD: country.freeShippingThresholdUSD,
                      isActive: country.isActive,
                  }
                : emptyForm
        );
        setSearch(country?.name ?? "");
        setShowOptions(false);
    }, [open, country]);

    if (!open) return null;

    const availableOptions = COUNTRY_OPTIONS.filter((option) => {
        const matchesSearch = option.name
            .toLowerCase()
            .includes(search.toLowerCase());

        const alreadyExists =
            existingCodes.includes(option.code) && option.code !== country?.code;

        return matchesSearch && !alreadyExists;
    });

    const update = (changes: Partial<CountryInput>) => {
        setForm((current) => ({ ...current, ...changes }));
    };

    const chooseCountry = (option: CountryOption) => {
        update({
            name: option.name,
            code: option.code,
            phoneCode: option.phoneCode,
            currencyCode: option.currencyCode,
            currencySymbol: option.currencySymbol,
        });

        setSearch(option.name);
        setShowOptions(false);
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        onSaveAction({
            ...form,
            name: form.name.trim(),
            code: form.code.trim().toUpperCase(),
            phoneCode: form.phoneCode.trim(),
            currencyCode: form.currencyCode.trim().toUpperCase(),
            currencySymbol: form.currencySymbol.trim(),
        });
    };

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/75 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onCloseAction();
            }}
        >
            <form
                onSubmit={submit}
                className="w-full max-w-lg border border-[#303030] bg-[#0b0b0b] p-5 text-white shadow-2xl"
            >
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h2 className="font-mono text-sm font-bold uppercase tracking-wider">
                            {country ? "Edit Country" : "Add Country"}
                        </h2>
                        <p className="mt-1 text-xs text-zinc-500">
                            Shipping and currency configuration
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onCloseAction}
                        aria-label="Close modal"
                        className="text-zinc-400 hover:text-white"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="relative mb-4">
                    <label htmlFor="country-search" className={labelClass}>
                        Country
                    </label>

                    <input
                        id="country-search"
                        value={search}
                        onFocus={() => !country && setShowOptions(true)}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setShowOptions(true);
                            update({
                                name: event.target.value,
                                code: "",
                                phoneCode: "",
                                currencyCode: "",
                                currencySymbol: "",
                            });
                        }}
                        placeholder="Search a country..."
                        autoComplete="off"
                        required
                        readOnly={Boolean(country)}
                        className={inputClass}
                    />

                    {showOptions && !country && (
                        <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto border border-[#303030] bg-[#101010]">
                            {availableOptions.length ? (
                                availableOptions.map((option) => (
                                    <button
                                        type="button"
                                        key={option.code}
                                        onClick={() => chooseCountry(option)}
                                        className="block w-full px-3 py-2.5 text-left text-sm hover:bg-[#c8ff00] hover:text-black"
                                    >
                                        {option.name}
                                        <span className="float-right text-xs opacity-60">
                                            {option.code} · {option.currencyCode}
                                        </span>
                                    </button>
                                ))
                            ) : (
                                <p className="px-3 py-3 text-xs text-zinc-500">
                                    No available countries found.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="mb-4 grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelClass}>Country code</label>
                        <input value={form.code} readOnly className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Phone prefix</label>
                        <input value={form.phoneCode} readOnly className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Currency code</label>
                        <input value={form.currencyCode} readOnly className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Currency symbol</label>
                        <input value={form.currencySymbol} readOnly className={inputClass} />
                    </div>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="country-shipping-fee" className={labelClass}>
                            Shipping fee (USD)
                        </label>
                        <input
                            id="country-shipping-fee"
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            value={form.shippingFeeUSD}
                            onChange={(event) =>
                                update({ shippingFeeUSD: Number(event.target.value) })
                            }
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label htmlFor="country-free-threshold" className={labelClass}>
                            Free shipping (USD)
                        </label>
                        <input
                            id="country-free-threshold"
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            value={form.freeShippingThresholdUSD}
                            onChange={(event) =>
                                update({
                                    freeShippingThresholdUSD: Number(event.target.value),
                                })
                            }
                            className={inputClass}
                        />
                    </div>
                </div>

                <label className="mb-5 flex cursor-pointer items-center gap-2 text-xs text-zinc-300">
                    <input
                        type="checkbox"
                        checked={Boolean(form.isActive)}
                        onChange={(event) => update({ isActive: event.target.checked })}
                        className="accent-[#c8ff00]"
                    />
                    Available for shipping
                </label>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onCloseAction}
                        className="h-10 flex-1 border border-[#303030] font-mono text-[10px] font-bold uppercase tracking-wider hover:border-white"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={
                            isSaving ||
                            !form.code ||
                            (existingCodes.includes(form.code) && form.code !== country?.code)
                        }
                        className="h-10 flex-1 bg-[#c8ff00] font-mono text-[10px] font-bold uppercase tracking-wider text-black hover:bg-[#b4e900] disabled:opacity-50"
                    >
                        {isSaving ? "Saving..." : country ? "Save Changes" : "Add Country"}
                    </button>
                </div>
            </form>
        </div>
    );
}
