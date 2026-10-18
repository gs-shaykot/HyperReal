"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Globe2, Search, X } from "lucide-react";
import type {
    CountryInput,
    OperationalCountry,
} from "@/app/Hooks/useAdminCountries";
import CountryFlag from "@/app/components/admin_component/settings/CountryFlag";

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

function countryFlag(code: string) {
    return code.toUpperCase().replace(/[A-Z]/g, (letter) =>
        String.fromCodePoint(letter.charCodeAt(0) + 127397)
    );
}

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
                    freeShippingThresholdUSD:
                        country.freeShippingThresholdUSD,
                    isActive: country.isActive,
                }
                : { ...emptyForm }
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
            existingCodes.includes(option.code) &&
            option.code !== country?.code;

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
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onCloseAction();
                }
            }}
        >
            <form
                onSubmit={submit}
                className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-[#303030] bg-[#0b0b0b] text-white shadow-2xl"
            >
                <div className="flex items-start justify-between border-b border-[#292929] p-5">
                    <div className="flex items-start gap-3">
                        <Globe2 size={17} className="mt-0.5 text-zinc-200" />
                        <div>
                            <h2 className="font-mono text-sm font-bold uppercase tracking-wider">
                                {country ? "Edit Country" : "Add Country"}
                            </h2>
                            <p className="mt-1 text-xs text-zinc-500">
                                {country
                                    ? "Update this shipping destination"
                                    : "Add a new country to your shipping destinations"}
                            </p>
                        </div>
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

                <div className="space-y-5 p-5">
                    <div className="relative">
                        <label htmlFor="country-search" className={labelClass}>
                            Select country
                        </label>

                        <button
                            type="button"
                            onClick={() => {
                                if (!country) {
                                    setShowOptions((value) => !value);
                                }
                            }}
                            disabled={Boolean(country)}
                            className={`${inputClass} flex items-center justify-between text-left ${showOptions ? "border-[#c8ff00]" : ""
                                }`}
                        >
                            <span className="flex min-w-0 items-center gap-2">
                                {form.code ? (
                                    <span aria-hidden="true">
                                        {countryFlag(form.code)}
                                    </span>
                                ) : null}
                                <span className="truncate">
                                    {form.name || "Select a country..."}
                                </span>
                            </span>
                            <ChevronDown
                                size={15}
                                className={`shrink-0 transition-transform ${showOptions ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        {showOptions && !country && (
                            <div className="absolute z-20 mt-1 w-full border border-[#303030] bg-[#090909] shadow-xl">
                                <div className="border-b border-[#292929] p-2">
                                    <div className="relative">
                                        <Search
                                            size={14}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                                        />
                                        <input
                                            id="country-search"
                                            value={search}
                                            onChange={(event) =>
                                                setSearch(event.target.value)
                                            }
                                            placeholder="Search country..."
                                            autoComplete="off"
                                            className="h-9 w-full border border-[#303030] bg-[#101010] pl-9 pr-3 text-sm outline-none focus:border-[#c8ff00]"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="max-h-56 overflow-y-auto p-1">
                                    {availableOptions.length ? (
                                        availableOptions.map((option) => (
                                            <button
                                                type="button"
                                                key={option.code}
                                                onClick={() =>
                                                    chooseCountry(option)
                                                }
                                                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-[#c8ff00] hover:text-black"
                                            >
                                                <CountryFlag code={option.code} size={24} />
                                                <span className="min-w-0 flex-1 truncate">
                                                    {option.name}
                                                </span>
                                                <span className="font-mono text-xs opacity-70">
                                                    {option.code}
                                                </span>
                                                <span className="font-mono text-xs opacity-70">
                                                    {option.currencyCode} (
                                                    {option.currencySymbol})
                                                </span>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="px-3 py-4 text-xs text-zinc-500">
                                            No available countries found.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className={labelClass}>Country code</label>
                            <input
                                value={form.code}
                                readOnly
                                placeholder="—"
                                className={inputClass}
                            />
                            <p className="mt-1 text-[10px] text-zinc-500">
                                · Auto-filled
                            </p>
                        </div>
                        <div>
                            <label className={labelClass}>Currency code</label>
                            <input
                                value={form.currencyCode}
                                readOnly
                                placeholder="—"
                                className={inputClass}
                            />
                            <p className="mt-1 text-[10px] text-zinc-500">
                                · Auto-filled
                            </p>
                        </div>
                        <div>
                            <label className={labelClass}>Currency symbol</label>
                            <input
                                value={form.currencySymbol}
                                readOnly
                                placeholder="—"
                                className={inputClass}
                            />
                            <p className="mt-1 text-[10px] text-zinc-500">
                                · Auto-filled
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label
                                htmlFor="country-shipping-fee"
                                className={labelClass}
                            >
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
                                    update({
                                        shippingFeeUSD: Number(
                                            event.target.value
                                        ),
                                    })
                                }
                                className={inputClass}
                            />
                            <p className="mt-1 text-[10px] text-zinc-500">
                                Shipping charge for this country
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="country-free-threshold"
                                className={labelClass}
                            >
                                Free shipping threshold (USD)
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
                                        freeShippingThresholdUSD: Number(
                                            event.target.value
                                        ),
                                    })
                                }
                                className={inputClass}
                            />
                            <p className="mt-1 text-[10px] text-zinc-500">
                                Minimum order value for free shipping
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Status</label>
                        <button
                            type="button"
                            onClick={() =>
                                update({ isActive: !form.isActive })
                            }
                            aria-pressed={Boolean(form.isActive)}
                            className={`h-7 min-w-17 border px-3 font-mono text-[10px] font-bold uppercase tracking-wider ${form.isActive
                                    ? "border-[#c8ff00] bg-[#c8ff00]/10 text-[#c8ff00]"
                                    : "border-[#303030] text-zinc-500"
                                }`}
                        >
                            {form.isActive ? "Active" : "Inactive"}
                        </button>
                        <p className="mt-1 text-[10px] text-zinc-500">
                            Active countries will be available for shipping at
                            checkout.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 border-t border-[#292929] p-5">
                    <button
                        type="button"
                        onClick={onCloseAction}
                        className="h-11 flex-1 border border-[#303030] font-mono text-[10px] font-bold uppercase tracking-wider hover:border-white"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={
                            isSaving ||
                            !form.code ||
                            (existingCodes.includes(form.code) &&
                                form.code !== country?.code)
                        }
                        className="flex h-11 flex-1 items-center justify-center gap-2 bg-[#c8ff00] font-mono text-[10px] font-bold uppercase tracking-wider text-black hover:bg-[#b4e900] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSaving
                            ? "Saving..."
                            : country
                                ? "Save Changes"
                                : "+ Add Country"}
                    </button>
                </div>
            </form>
        </div>
    );
}
