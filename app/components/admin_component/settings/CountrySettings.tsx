"use client";

import {
    Globe,
    Plus,
    RefreshCw,
    Pencil,
    Trash2,
    ArrowUp,
    ArrowDown,
    Info,
    LoaderCircle,
} from "lucide-react";
import type { OperationalCountry } from "@/app/Hooks/useAdminSettings";

type CountryWithRates = OperationalCountry & {
    phoneCode?: string;
    currentExchangeRate?: number | null;
    previousExchangeRate?: number | null;
    exchangeRateDate?: string | Date | null;
};

type Props = {
    countries: CountryWithRates[];
    isLoading?: boolean;
    isRefreshingRates?: boolean;
    deletingCountryId?: string | null;
    onAddAction: () => void;
    onEditAction: (country: CountryWithRates) => void;
    onDeleteAction: (id: string) => void;
    onToggleStatusAction: (country: CountryWithRates) => void;
    onRefreshRatesAction?: () => void;
};

const panelClass = "border border-white/10 bg-[#0d0f10]";
const mutedText = "text-xs text-white/50";

function getFlagEmoji(countryCode: string) {
    if (!/^[A-Z]{2}$/i.test(countryCode)) return "🌐";

    return countryCode
        .toUpperCase()
        .split("")
        .map((char) =>
            String.fromCodePoint(127397 + char.charCodeAt(0))
        )
        .join("");
}

function formatUSD(amount: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

function formatRate(rate: number | null | undefined) {
    if (rate == null || !Number.isFinite(rate)) return "—";

    return rate.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
    });
}

function ExchangeRateChange({
    current,
    previous,
}: {
    current: number | null | undefined;
    previous: number | null | undefined;
}) {
    if (
        current == null ||
        previous == null ||
        !Number.isFinite(current) ||
        !Number.isFinite(previous)
    ) {
        return <span className="text-white/40">—</span>;
    }

    if (previous === 0) {
        return <span className="text-white/40">—</span>;
    }

    const change = current - previous;
    const percentChange = (change / previous) * 100;

    if (change === 0) {
        return (
            <span className="inline-flex items-center gap-1 text-white/50">
                — 0.00%
            </span>
        );
    }

    const isIncrease = change > 0;

    return (
        <span
            className={`inline-flex items-center gap-1 whitespace-nowrap ${
                isIncrease ? "text-lime-400" : "text-red-400"
            }`}
            title={`Previous: ${formatRate(previous)}; Current: ${formatRate(current)}`}
        >
            {isIncrease ? (
                <ArrowUp className="size-3" />
            ) : (
                <ArrowDown className="size-3" />
            )}
            {Math.abs(percentChange).toFixed(2)}%
        </span>
    );
}

export function CountrySettings({
    countries,
    isLoading = false,
    isRefreshingRates = false,
    deletingCountryId = null,
    onAddAction,
    onEditAction,
    onDeleteAction,
    onToggleStatusAction,
    onRefreshRatesAction,
}: Props) {
    const handleDelete = (country: CountryWithRates) => {
        const confirmed = window.confirm(
            `Delete ${country.name} from operational countries?`
        );

        if (confirmed) {
            onDeleteAction(country.id);
        }
    };

    return (
        <section className={`${panelClass} p-4 sm:p-5`}>
            {/* Header */}
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center border border-white/10">
                        <Globe className="size-5 text-white/80" />
                    </div>

                    <div>
                        <h2 className="font-mono text-sm font-bold tracking-wide text-white">
                            COUNTRY & SHIPPING SETTINGS
                        </h2>

                        <p className={`mt-1 ${mutedText}`}>
                            Manage shipping destinations, local currencies,
                            and shipping thresholds.
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 gap-2">
                    {onRefreshRatesAction && (
                        <button
                            type="button"
                            onClick={onRefreshRatesAction}
                            disabled={isRefreshingRates}
                            title="Refresh exchange rates"
                            className="flex items-center justify-center border border-white/15 px-3 py-2 text-white transition hover:border-lime-400 hover:text-lime-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isRefreshingRates ? (
                                <LoaderCircle className="size-4 animate-spin" />
                            ) : (
                                <RefreshCw className="size-4" />
                            )}
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onAddAction}
                        className="flex items-center justify-center gap-2 bg-lime-400 px-4 py-2 font-mono text-xs font-bold text-black transition hover:bg-lime-300"
                    >
                        <Plus className="size-4" />
                        ADD COUNTRY
                    </button>
                </div>
            </div>

            {/* Country table */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-262.5 border-collapse text-left font-mono text-xs">
                    <thead>
                        <tr className="bg-white/4 text-[10px] tracking-wider text-white/60">
                            <th className="border border-white/10 px-3 py-3">#</th>
                            <th className="border border-white/10 px-3 py-3">COUNTRY</th>
                            <th className="border border-white/10 px-3 py-3">CODE</th>
                            <th className="border border-white/10 px-3 py-3">CURRENCY</th>
                            <th className="border border-white/10 px-3 py-3">
                                EXCHANGE RATE (1 USD = ?)
                            </th>
                            <th className="border border-white/10 px-3 py-3">
                                SHIPPING FEE
                            </th>
                            <th className="border border-white/10 px-3 py-3">
                                FREE SHIPPING THRESHOLD
                            </th>
                            <th className="border border-white/10 px-3 py-3">STATUS</th>
                            <th className="border border-white/10 px-3 py-3">ACTIONS</th>
                        </tr>
                    </thead>

                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td
                                    colSpan={9}
                                    className="border border-white/10 px-4 py-12 text-center text-white/50"
                                >
                                    <LoaderCircle className="mx-auto mb-2 size-5 animate-spin" />
                                    Loading countries...
                                </td>
                            </tr>
                        ) : countries.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={9}
                                    className="border border-white/10 px-4 py-12 text-center"
                                >
                                    <Globe className="mx-auto mb-2 size-6 text-white/30" />
                                    <p className="text-white/70">
                                        No operational countries configured.
                                    </p>
                                    <p className={`mt-1 ${mutedText}`}>
                                        Add a country to make it available for shipping.
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            countries.map((country, index) => (
                                <tr
                                    key={country.id}
                                    className="transition hover:bg-white/2.5"
                                >
                                    <td className="border border-white/10 px-3 py-3 text-white/50">
                                        {index + 1}
                                    </td>

                                    <td className="border border-white/10 px-3 py-3">
                                        <div className="flex items-center gap-2 whitespace-nowrap">
                                            <span className="text-base">
                                                {getFlagEmoji(country.code)}
                                            </span>
                                            <span className="font-semibold text-white">
                                                {country.name}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="border border-white/10 px-3 py-3 font-semibold text-white/80">
                                        {country.code}
                                    </td>

                                    <td className="border border-white/10 px-3 py-3 whitespace-nowrap">
                                        <span className="text-white">
                                            {country.currencyCode}
                                        </span>
                                        <span className="ml-1 text-white/50">
                                            ({country.currencySymbol})
                                        </span>
                                    </td>

                                    <td className="border border-white/10 px-3 py-3">
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                            <span className="text-white">
                                                {formatRate(country.currentExchangeRate)}
                                            </span>

                                            <ExchangeRateChange
                                                current={country.currentExchangeRate}
                                                previous={country.previousExchangeRate}
                                            />
                                        </div>
                                    </td>

                                    <td className="border border-white/10 px-3 py-3 whitespace-nowrap text-white">
                                        {formatUSD(country.shippingFeeUSD)}
                                    </td>

                                    <td className="border border-white/10 px-3 py-3 whitespace-nowrap text-white">
                                        {formatUSD(country.freeShippingThresholdUSD)}
                                    </td>

                                    <td className="border border-white/10 px-3 py-3">
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={country.isActive}
                                            onClick={() => onToggleStatusAction(country)}
                                            title={
                                                country.isActive
                                                    ? "Deactivate country"
                                                    : "Activate country"
                                            }
                                            className={`relative h-5 w-10 rounded-full transition ${
                                                country.isActive
                                                    ? "bg-lime-400"
                                                    : "bg-white/20"
                                            }`}
                                        >
                                            <span
                                                className={`absolute top-0.5 size-4 rounded-full bg-black transition-all ${
                                                    country.isActive
                                                        ? "left-5.5"
                                                        : "left-0.5"
                                                }`}
                                            />
                                        </button>

                                        <span className="sr-only">
                                            {country.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>

                                    <td className="border border-white/10 px-3 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => onEditAction(country)}
                                                title={`Edit ${country.name}`}
                                                className="border border-white/15 p-2 text-white/70 transition hover:border-lime-400 hover:text-lime-400"
                                            >
                                                <Pencil className="size-3.5" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDelete(country)}
                                                disabled={deletingCountryId === country.id}
                                                title={`Delete ${country.name}`}
                                                className="border border-white/15 p-2 text-red-400 transition hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {deletingCountryId === country.id ? (
                                                    <LoaderCircle className="size-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="size-3.5" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer note */}
            <div className="mt-4 flex items-start gap-2 border border-white/10 bg-white/2 p-3">
                <Info className="mt-0.5 size-4 shrink-0 text-white/50" />

                <p className={mutedText}>
                    Exchange rates are informational estimates fetched from an
                    exchange-rate service. Shipping fees and free-shipping
                    thresholds are configured in USD. Checkout charges remain
                    in USD.
                </p>
            </div>
        </section>
    );
}