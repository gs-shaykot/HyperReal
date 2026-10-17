
"use client";

import { useMemo, useState } from "react";
import { Globe2, Pencil, Plus, Search } from "lucide-react";
import toast from "react-hot-toast";
import CountryModal from "@/app/components/admin_component/settings/CountryModal";
import {
    type CountryInput,
    type OperationalCountry,
    useAdminCountries,
    useSaveCountry,
    useToggleCountry,
} from "@/app/Hooks/useAdminCountries";

type Filter = "ALL" | "ACTIVE" | "INACTIVE";

function formatRate(country: OperationalCountry) {
    if (country.currentExchangeRate === null) return "—";

    return new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 4,
    }).format(country.currentExchangeRate);
}

function rateChange(country: OperationalCountry) {
    const current = country.currentExchangeRate;
    const previous = country.previousExchangeRate;

    if (
        current === null ||
        previous === null ||
        previous === 0
    ) {
        return null;
    }

    return ((current - previous) / previous) * 100;
}

export default function CountrySettings() {
    const { data: countries = [], isLoading, isError, refetch } =
        useAdminCountries();

    const saveMutation = useSaveCountry();
    const toggleMutation = useToggleCountry();

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<Filter>("ALL");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCountry, setEditingCountry] =
        useState<OperationalCountry | null>(null);

    const filteredCountries = useMemo(() => {
        return countries.filter((country) => {
            const matchesSearch =
                country.name.toLowerCase().includes(search.toLowerCase()) ||
                country.code.toLowerCase().includes(search.toLowerCase()) ||
                country.currencyCode.toLowerCase().includes(search.toLowerCase());

            const matchesFilter =
                filter === "ALL" ||
                (filter === "ACTIVE" && country.isActive) ||
                (filter === "INACTIVE" && !country.isActive);

            return matchesSearch && matchesFilter;
        });
    }, [countries, search, filter]);

    const openAddModal = () => {
        setEditingCountry(null);
        setModalOpen(true);
    };

    const openEditModal = (country: OperationalCountry) => {
        setEditingCountry(country);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingCountry(null);
    };

    const saveCountry = (data: CountryInput) => {
        saveMutation.mutate(data, {
            onSuccess: () => closeModal(),
        });
    };

    const toggleCountry = (country: OperationalCountry) => {
        toggleMutation.mutate({
            ...country,
            isActive: !country.isActive,
        });
    };

    if (isLoading) {
        return (
            <section className="border border-[#292929] bg-[#0b0b0b] p-5 text-sm text-zinc-400">
                Loading country settings...
            </section>
        );
    }

    if (isError) {
        return (
            <section className="border border-[#292929] bg-[#0b0b0b] p-5">
                <p className="text-sm text-red-400">
                    Could not load country settings.
                </p>
                <button
                    type="button"
                    onClick={() => refetch()}
                    className="mt-3 border border-zinc-700 px-4 py-2 font-mono text-xs text-white hover:border-[#c8ff00]"
                >
                    Retry
                </button>
            </section>
        );
    }

    return (
        <>
            <section className="min-w-0 border border-[#292929] bg-[#0b0b0b] p-4 text-white sm:p-5">
                <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#292929] text-[#c8ff00]">
                            <Globe2 size={17} />
                        </div>
                        <div>
                            <h2 className="font-mono text-xs font-bold uppercase tracking-wider">
                                Country &amp; Shipping Settings
                            </h2>
                            <p className="mt-1 text-xs text-zinc-500">
                                Manage shipping destinations and local currency information
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="flex h-10 items-center justify-center gap-2 bg-[#c8ff00] px-4 font-mono text-[10px] font-bold uppercase tracking-wider text-black hover:bg-[#b4e900]"
                    >
                        <Plus size={14} />
                        Add Country
                    </button>
                </div>

                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="relative w-full md:max-w-xs">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                        />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search country or currency..."
                            aria-label="Search countries"
                            className="h-10 w-full border border-[#292929] bg-transparent pl-9 pr-3 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-[#c8ff00]"
                        />
                    </div>

                    <div className="flex border border-[#292929]">
                        {(["ALL", "ACTIVE", "INACTIVE"] as Filter[]).map((item) => (
                            <button
                                type="button"
                                key={item}
                                onClick={() => setFilter(item)}
                                className={`px-3 py-2 font-mono text-[9px] font-bold tracking-wider transition ${
                                    filter === item
                                        ? "bg-[#c8ff00] text-black"
                                        : "text-zinc-400 hover:text-white"
                                }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto border border-[#292929]">
                    <table className="w-full min-w-237.5 border-collapse text-left">
                        <thead>
                            <tr className="border-b border-[#292929] bg-[#101010]">
                                {[
                                    "Country",
                                    "Currency",
                                    "Exchange Rate / USD",
                                    "Shipping (USD)",
                                    "Free Shipping (USD)",
                                    "Status",
                                    "Action",
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        className="px-3 py-3 font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-500"
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {filteredCountries.map((country) => {
                                const change = rateChange(country);

                                return (
                                    <tr
                                        key={country.id}
                                        className="border-b border-[#222] last:border-b-0 hover:bg-white/2"
                                    >
                                        <td className="px-3 py-3">
                                            <div className="text-xs font-semibold">
                                                {country.name}
                                            </div>
                                            <div className="mt-1 font-mono text-[10px] text-zinc-500">
                                                {country.code} · {country.phoneCode}
                                            </div>
                                        </td>

                                        <td className="px-3 py-3">
                                            <div className="text-xs">
                                                {country.currencyCode}
                                            </div>
                                            <div className="mt-1 text-[10px] text-zinc-500">
                                                {country.currencySymbol}
                                            </div>
                                        </td>

                                        <td className="px-3 py-3">
                                            <div className="font-mono text-xs">
                                                {formatRate(country)}
                                            </div>
                                            {change !== null && (
                                                <div
                                                    className={`mt-1 text-[10px] ${
                                                        change > 0
                                                            ? "text-emerald-400"
                                                            : change < 0
                                                              ? "text-red-400"
                                                              : "text-zinc-500"
                                                    }`}
                                                >
                                                    {change > 0 ? "+" : ""}
                                                    {change.toFixed(2)}%
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-3 py-3 font-mono text-xs">
                                            ${country.shippingFeeUSD.toFixed(2)}
                                        </td>

                                        <td className="px-3 py-3 font-mono text-xs">
                                            ${country.freeShippingThresholdUSD.toFixed(2)}
                                        </td>

                                        <td className="px-3 py-3">
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={country.isActive}
                                                aria-label={`Set ${country.name} ${
                                                    country.isActive ? "inactive" : "active"
                                                }`}
                                                onClick={() => toggleCountry(country)}
                                                disabled={toggleMutation.isPending}
                                                className={`relative h-4.5 w-8 border border-[#c8ff00] transition ${
                                                    country.isActive
                                                        ? "bg-[#c8ff00]"
                                                        : "bg-transparent"
                                                }`}
                                            >
                                                <span
                                                    className={`absolute top-0.5 h-3 w-3 bg-black transition-all ${
                                                        country.isActive
                                                            ? "left-3.75"
                                                            : "left-0.5"
                                                    }`}
                                                />
                                            </button>
                                            <div
                                                className={`mt-1 text-[9px] uppercase ${
                                                    country.isActive
                                                        ? "text-[#c8ff00]"
                                                        : "text-zinc-500"
                                                }`}
                                            >
                                                {country.isActive ? "Active" : "Inactive"}
                                            </div>
                                        </td>

                                        <td className="px-3 py-3">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(country)}
                                                aria-label={`Edit ${country.name}`}
                                                className="flex h-8 w-8 items-center justify-center border border-[#292929] text-zinc-400 hover:border-[#c8ff00] hover:text-[#c8ff00]"
                                            >
                                                <Pencil size={13} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filteredCountries.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-10 text-center text-xs text-zinc-500"
                                    >
                                        No countries match your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <p className="mt-3 text-[10px] leading-relaxed text-zinc-500">
                    Shipping fees and free-shipping thresholds are stored in USD.
                    Exchange rates appear only after rate data has been populated.
                </p>
            </section>

            <CountryModal
                open={modalOpen}
                country={editingCountry}
                existingCodes={countries.map((country) => country.code)}
                onCloseAction={closeModal}
                onSaveAction={saveCountry}
                isSaving={saveMutation.isPending}
            />
        </>
    );
}
