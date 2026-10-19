
"use client";

import { useMemo, useState } from "react";
import {
    Globe2,
    Pencil,
    Plus,
    Search,
    Trash2,
    RefreshCw,
} from "lucide-react";
import CountryModal from "@/app/components/admin_component/settings/CountryModal";
import {
    type CountryInput,
    type OperationalCountry,
    useAdminCountries,
    useDeleteCountry,
    useRefreshExchangeRates,
    useSaveCountry,
    useToggleCountry,
} from "@/app/Hooks/useAdminCountries";
import CountryFlag from "@/app/components/admin_component/settings/CountryFlag";

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

    if (current === null || previous === null || previous === 0) {
        return null;
    }

    return ((current - previous) / previous) * 100;
}

function formatRateDate(date: string | null) {
    if (!date) return "Not updated";

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "Date unavailable";

    return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
    }).format(parsed);
}

export default function CountrySettings() {
    const {
        data: countries = [],
        isLoading,
        isError,
        refetch,
    } = useAdminCountries();

    const saveMutation = useSaveCountry();
    const toggleMutation = useToggleCountry();
    const deleteMutation = useDeleteCountry();
    const refreshRatesMutation = useRefreshExchangeRates();

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<Filter>("ALL");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCountry, setEditingCountry] =
        useState<OperationalCountry | null>(null);

    const filteredCountries = useMemo(() => {
        const normalizedSearch = search.toLowerCase().trim();

        return countries.filter((country) => {
            const matchesSearch =
                country.name.toLowerCase().includes(normalizedSearch) ||
                country.code.toLowerCase().includes(normalizedSearch) ||
                country.currencyCode.toLowerCase().includes(normalizedSearch);

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
            onSuccess: closeModal,
        });
    };

    const toggleCountry = (country: OperationalCountry) => {
        toggleMutation.mutate({
            ...country,
            isActive: !country.isActive,
        });
    };

    const deleteCountry = (country: OperationalCountry) => {
        const confirmed = window.confirm(
            `Delete ${country.name} (${country.code})? This action cannot be undone.`
        );

        if (confirmed) {
            deleteMutation.mutate(country.id);
        }
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
                    className="mt-3 border border-zinc-700 px-4 py-2 font-mono text-sm text-white hover:border-[#c8ff00]"
                >
                    Retry
                </button>
            </section>
        );
    }

    return (
        <>
            <section className="min-w-0 border border-[#292929] bg-[#0b0b0b] p-4 text-white sm:p-5">
                <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#292929] text-zinc-200">
                            <Globe2 size={16} />
                        </div>
                        <div>
                            <h2 className="font-mono text-xs font-bold uppercase tracking-wider">
                                Country &amp; Shipping Settings
                            </h2>
                            <p className="mt-1 text-xs text-zinc-500">
                                Manage available countries, currency and
                                shipping settings
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => refreshRatesMutation.mutate()}
                            disabled={refreshRatesMutation.isPending}
                            title="Fetch the latest available reference rates"
                            className="flex h-9 items-center justify-center gap-2 border border-[#383838] px-4 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-200 hover:border-[#c8ff00] hover:text-[#c8ff00] disabled:cursor-wait disabled:opacity-60"
                        >
                            <RefreshCw
                                size={13}
                                className={
                                    refreshRatesMutation.isPending
                                        ? "animate-spin"
                                        : ""
                                }
                            />
                            {refreshRatesMutation.isPending
                                ? "Updating..."
                                : "Refresh Rates"}
                        </button>

                        <button
                            type="button"
                            onClick={openAddModal}
                            className="flex h-9 items-center justify-center gap-2 bg-[#c8ff00] px-4 font-mono text-[10px] font-bold uppercase tracking-wider text-black hover:bg-[#b4e900]"
                        >
                            <Plus size={14} />
                            Add Country
                        </button>
                    </div>
                </div>

                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-xs">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                        />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search country or currency..."
                            aria-label="Search countries"
                            className="h-9 w-full border border-[#292929] bg-transparent pl-9 pr-3 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-[#c8ff00]"
                        />
                    </div>

                    <div className="flex self-start border border-[#292929]">
                        {(["ALL", "ACTIVE", "INACTIVE"] as Filter[]).map(
                            (item) => (
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
                            )
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto border border-[#292929]">
                    <table className="w-full min-w-262.5 border-collapse text-left">
                        <thead>
                            <tr className="border-b border-[#292929] bg-[#151515]">
                                {[
                                    "#",
                                    "Country",
                                    "Code",
                                    "Currency",
                                    "Exchange Rate (1 USD = ?)",
                                    "Shipping Fee",
                                    "Free Shipping Threshold",
                                    "Status",
                                    "Actions",
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        className="whitespace-nowrap px-3 py-3 font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-500"
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {filteredCountries.map((country, index) => {
                                const change = rateChange(country);

                                return (
                                    <tr
                                        key={country.id}
                                        className="border-b border-[#292929] last:border-b-0 hover:bg-white/2"
                                    >
                                        <td className="w-10 px-3 py-3 font-mono text-[10px] text-zinc-500">
                                            {index + 1}
                                        </td>

                                        <td className="min-w-45 whitespace-nowrap px-3 py-3">
                                            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-white">
                                                <CountryFlag
                                                    code={country.code}
                                                    size={24}
                                                />
                                                <span>{country.name}</span>
                                            </div>
                                        </td>

                                        <td className="px-3 py-3 font-mono text-[11px] text-white">
                                            {country.code}
                                        </td>

                                        <td className="whitespace-nowrap px-3 py-3 font-mono text-[11px] text-white">
                                            {country.currencyCode} (
                                            {country.currencySymbol})
                                        </td>

                                        <td className="whitespace-nowrap px-3 py-3">
                                            <div className="font-mono text-[11px] text-white">
                                                {formatRate(country)}
                                            </div>

                                            {change !== null && (
                                                <div
                                                    className={`mt-1 font-mono text-[10px] ${
                                                        change > 0
                                                            ? "text-emerald-400"
                                                            : change < 0
                                                              ? "text-red-400"
                                                              : "text-zinc-500"
                                                    }`}
                                                >
                                                    {change > 0
                                                        ? "↑ +"
                                                        : change < 0
                                                          ? "↓ "
                                                          : ""}
                                                    {change.toFixed(2)}%
                                                </div>
                                            )}

                                            <div className="mt-1 text-[9px] text-zinc-500">
                                                {formatRateDate(
                                                    country.exchangeRateDate
                                                )}
                                            </div>
                                        </td>

                                        <td className="whitespace-nowrap px-3 py-3 font-mono text-[11px] text-white">
                                            $ {country.shippingFeeUSD.toFixed(2)}
                                        </td>

                                        <td className="whitespace-nowrap px-3 py-3 font-mono text-[11px] text-white">
                                            ${" "}
                                            {country.freeShippingThresholdUSD.toFixed(
                                                2
                                            )}
                                        </td>

                                        <td className="w-26.25 px-3 py-3">
                                            <div className="flex min-h-8 flex-col items-start justify-center gap-1">
                                                <button
                                                    type="button"
                                                    role="switch"
                                                    aria-checked={country.isActive}
                                                    aria-label={`Set ${country.name} ${
                                                        country.isActive
                                                            ? "inactive"
                                                            : "active"
                                                    }`}
                                                    onClick={() =>
                                                        toggleCountry(country)
                                                    }
                                                    disabled={
                                                        toggleMutation.isPending
                                                    }
                                                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-[#c8ff00] transition-colors duration-200 disabled:cursor-wait disabled:opacity-60 ${
                                                        country.isActive
                                                            ? "bg-[#c8ff00]"
                                                            : "bg-[#2a2d30]"
                                                    }`}
                                                >
                                                    <span
                                                        className={`pointer-events-none absolute left-0.5 h-3.5 w-3.5 rounded-full transition-transform duration-200 ${
                                                            country.isActive
                                                                ? "translate-x-4 bg-black"
                                                                : "translate-x-0 bg-[#8b939e]"
                                                        }`}
                                                    />
                                                </button>
                                            </div>
                                        </td>

                                        <td className="w-22 whitespace-nowrap px-3 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditModal(country)
                                                    }
                                                    aria-label={`Edit ${country.name}`}
                                                    title="Edit country"
                                                    className="flex h-7 w-7 items-center justify-center border border-[#292929] text-zinc-400 hover:border-[#c8ff00] hover:text-[#c8ff00]"
                                                >
                                                    <Pencil size={13} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        deleteCountry(country)
                                                    }
                                                    disabled={
                                                        deleteMutation.isPending
                                                    }
                                                    aria-label={`Delete ${country.name}`}
                                                    title="Delete country"
                                                    className="flex h-7 w-7 items-center justify-center border border-[#292929] text-red-400 hover:border-red-500 hover:bg-red-500/10 disabled:cursor-wait disabled:opacity-50"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filteredCountries.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-4 py-10 text-center font-mono text-xs text-zinc-500"
                                    >
                                        No countries match your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-3 flex items-start gap-2 border border-[#292929] bg-[#111111] p-3">
                    <span className="text-zinc-400">ⓘ</span>
                    <p className="text-[11px] leading-relaxed text-zinc-500">
                        Exchange rates are reference rates for 1 USD and may
                        not match a bank or payment provider&apos;s rate.
                        Refresh rates manually when needed. Shipping fees and
                        free-shipping thresholds remain stored in USD;
                        checkout conversion is a separate feature.
                    </p>
                </div>
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
