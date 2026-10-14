
"use client";
 
import {
    useDeleteCountry,
    useAdminSettings,
    useExchangeRates,
    useOperationalCountries,
    useSaveAdminSettings,
    useSaveCountry,
    type OperationalCountry,
    type StoreSettings,
} from "@/app/Hooks/useAdminSettings";
import {
    CalendarDays,
    Globe,
    Megaphone,
    Pencil,
    Plus,
    RotateCcw,
    Save,
    Settings2,
    Trash2,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";

const emptyCountry = {
    name: "",
    code: "",
    currencyCode: "USD",
    currencySymbol: "$",
    shippingFeeUSD: 10,
    freeShippingThresholdUSD: 100,
    isActive: true,
};

const inputClass =
    "w-full border border-white/20 bg-black/30 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-second light:border-black/20 light:bg-white light:text-main";

const labelClass =
    "mb-1.5 block font-mono text-[10px] font-bold tracking-wider text-white/60 light:text-main/60";

const panelClass =
    "min-w-0 border border-white/15 bg-dark p-4 light:border-black/15 light:bg-white";

export default function AdminSettingsPage() {
    const settingsQuery = useAdminSettings();
    const countriesQuery = useOperationalCountries();
    const ratesQuery = useExchangeRates();

    const saveSettings = useSaveAdminSettings();
    const saveCountry = useSaveCountry();
    const deleteCountry = useDeleteCountry();

    const [settings, setSettings] = useState<StoreSettings | null>(null);
    const [countryModal, setCountryModal] = useState(false);
    const [editingCountry, setEditingCountry] =
        useState<OperationalCountry | null>(null);
    const [countryForm, setCountryForm] = useState(emptyCountry);

    useEffect(() => {
        if (settingsQuery.data) setSettings(settingsQuery.data);
    }, [settingsQuery.data]);

    if (settingsQuery.isPending || !settings) {
        return (
            <main className="min-h-screen bg-main p-6 font-mono text-sm text-white light:bg-white light:text-main">
                Loading settings...
            </main>
        );
    }

    const patch = (values: Partial<StoreSettings>) =>
        setSettings((current) =>
            current ? { ...current, ...values } : current
        );

    const openAddCountry = () => {
        setEditingCountry(null);
        setCountryForm(emptyCountry);
        setCountryModal(true);
    };

    const openEditCountry = (country: OperationalCountry) => {
        setEditingCountry(country);
        setCountryForm({
            name: country.name,
            code: country.code,
            currencyCode: country.currencyCode,
            currencySymbol: country.currencySymbol,
            shippingFeeUSD: country.shippingFeeUSD,
            freeShippingThresholdUSD: country.freeShippingThresholdUSD,
            isActive: country.isActive,
        });
        setCountryModal(true);
    };

    const submitCountry = () => {
        saveCountry.mutate(
            {
                ...(editingCountry ? { id: editingCountry.id } : {}),
                ...countryForm,
            },
            {
                onSuccess: () => setCountryModal(false),
            }
        );
    };

    const rates = ratesQuery.data ?? {};

    return (
        <main className="min-h-screen bg-main p-4 text-white light:bg-white light:text-main sm:p-5">
            <header className="mb-5">
                <h1 className="font-mono text-xl font-bold tracking-wider">
                    <span className="text-second">●</span> SETTINGS
                </h1>
                <p className="mt-1 font-mono text-xs text-white/50 light:text-main/50">
                    Store configuration &amp; preferences
                </p>
            </header>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {/* HOMEPAGE MARQUEE */}
                <section className={panelClass}>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 font-mono text-sm font-bold">
                            <Megaphone className="size-4" /> HOMEPAGE MARQUEE
                        </h2>
                        <button
                            type="button"
                            title="Reset marquee"
                            onClick={() => settingsQuery.refetch()}
                        >
                            <RotateCcw className="size-4 text-white/60" />
                        </button>
                    </div>

                    <label className="flex items-center justify-between font-mono text-xs">
                        SHOW MARQUEE
                        <input
                            type="checkbox"
                            className="toggle toggle-success h-6 w-11 rounded-full! border-none bg-[#2a2d30] light:bg-zinc-200 checked:bg-second"
                            checked={settings.showMarquee}
                            onChange={(event) =>
                                patch({ showMarquee: event.target.checked })
                            }
                        />
                    </label>

                    <label className={`${labelClass} mt-4`}>MESSAGES</label>
                    <div className="space-y-2">
                        {settings.marqueeMessages.map((message, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    className={inputClass}
                                    value={message}
                                    onChange={(event) =>
                                        patch({
                                            marqueeMessages: settings.marqueeMessages.map(
                                                (item, i) =>
                                                    i === index
                                                        ? event.target.value
                                                        : item
                                            ),
                                        })
                                    }
                                />
                                <button
                                    type="button"
                                    title="Remove message"
                                    className="border border-white/20 px-3 hover:text-red-400"
                                    onClick={() =>
                                        patch({
                                            marqueeMessages:
                                                settings.marqueeMessages.filter(
                                                    (_, i) => i !== index
                                                ),
                                        })
                                    }
                                >
                                    <X className="size-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="mt-3 font-mono text-xs font-bold text-second"
                        onClick={() =>
                            patch({
                                marqueeMessages: [
                                    ...settings.marqueeMessages,
                                    "NEW MESSAGE",
                                ],
                            })
                        }
                    >
                        <Plus className="mr-1 inline size-3" /> ADD MESSAGE
                    </button>

                    <label className={`${labelClass} mt-4`}>
                        SCROLL SPEED — {settings.marqueeScrollSpeed}S PER LOOP
                    </label>
                    <input
                        type="range"
                        min={10}
                        max={120}
                        value={settings.marqueeScrollSpeed}
                        onChange={(event) =>
                            patch({
                                marqueeScrollSpeed: Number(event.target.value),
                            })
                        }
                        className="range range-success range-xs w-full"
                    />

                    <div className="mt-4 bg-second p-3 font-mono text-xs font-bold text-black">
                        <Megaphone className="mr-2 inline size-4" />
                        {settings.marqueeMessages.join("  ◆  ")}
                    </div>

                    <button
                        type="button"
                        disabled={saveSettings.isPending}
                        onClick={() => saveSettings.mutate({
                            showMarquee: settings.showMarquee,
                            marqueeMessages: settings.marqueeMessages,
                            marqueeScrollSpeed: settings.marqueeScrollSpeed,
                        })}
                        className="mt-3 flex w-full items-center justify-center gap-2 bg-second p-3 font-mono text-xs font-bold text-black disabled:opacity-50"
                    >
                        <Save className="size-4" /> SAVE MARQUEE
                    </button>
                </section>

                {/* UPCOMING RELEASE */}
                <section className={panelClass}>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 font-mono text-sm font-bold">
                            <CalendarDays className="size-4" /> UPCOMING RELEASE
                        </h2>
                        <button
                            type="button"
                            title="Reload settings"
                            onClick={() => settingsQuery.refetch()}
                        >
                            <RotateCcw className="size-4 text-white/60" />
                        </button>
                    </div>

                    <label className="flex items-center justify-between font-mono text-xs">
                        SHOW SECTION
                        <input
                            type="checkbox"
                            className="toggle toggle-success h-6 w-11 rounded-full! border-none bg-[#2a2d30] light:bg-zinc-200 checked:bg-second"
                            checked={settings.showUpcomingRelease}
                            onChange={(event) =>
                                patch({
                                    showUpcomingRelease: event.target.checked,
                                })
                            }
                        />
                    </label>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {([
                            ["NAME LINE 1", "releaseNameLine1"],
                            ["NAME LINE 2", "releaseNameLine2"],
                            ["VERSION", "releaseVersion"],
                        ] as const).map(([label, field]) => (
                            <label key={field}>
                                <span className={labelClass}>{label}</span>
                                <input
                                    className={inputClass}
                                    value={settings[field]}
                                    onChange={(event) =>
                                        patch({ [field]: event.target.value })
                                    }
                                />
                            </label>
                        ))}
                    </div>

                    <label className={`${labelClass} mt-4`}>DESCRIPTION</label>
                    <textarea
                        rows={3}
                        className={inputClass}
                        value={settings.releaseDescription}
                        onChange={(event) =>
                            patch({ releaseDescription: event.target.value })
                        }
                    />

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <label>
                            <span className={labelClass}>COUNTDOWN ENDS</span>
                            <input
                                type="datetime-local"
                                className={inputClass}
                                value={
                                    settings.releaseCountdownEnds
                                        ? new Date(settings.releaseCountdownEnds)
                                            .toISOString().slice(0, 16)
                                        : ""
                                }
                                onChange={(event) =>
                                    patch({
                                        releaseCountdownEnds: event.target.value
                                            ? new Date(event.target.value).toISOString()
                                            : null,
                                    })
                                }
                            />
                        </label>
                        <label>
                            <span className={labelClass}>BUTTON LABEL</span>
                            <input
                                className={inputClass}
                                value={settings.releaseButtonLabel}
                                onChange={(event) =>
                                    patch({
                                        releaseButtonLabel: event.target.value,
                                    })
                                }
                            />
                        </label>
                    </div>

                    <button
                        type="button"
                        disabled={saveSettings.isPending}
                        onClick={() => saveSettings.mutate({
                            showUpcomingRelease: settings.showUpcomingRelease,
                            releaseNameLine1: settings.releaseNameLine1,
                            releaseNameLine2: settings.releaseNameLine2,
                            releaseVersion: settings.releaseVersion,
                            releaseDescription: settings.releaseDescription,
                            releaseCountdownEnds: settings.releaseCountdownEnds,
                            releaseButtonLabel: settings.releaseButtonLabel,
                        })}
                        className="mt-3 flex w-full items-center justify-center gap-2 bg-second p-3 font-mono text-xs font-bold text-black disabled:opacity-50"
                    >
                        <Save className="size-4" /> SAVE RELEASE
                    </button>
                </section>

                {/* STORE DETAILS */}
                <section className={panelClass}>
                    <h2 className="mb-4 flex items-center gap-2 font-mono text-sm font-bold">
                        <Settings2 className="size-4" /> STORE DETAILS
                    </h2>

                    <label className={labelClass}>STORE NAME</label>
                    <input
                        className={inputClass}
                        value={settings.storeName}
                        onChange={(event) =>
                            patch({ storeName: event.target.value })
                        }
                    />

                    <label className={`${labelClass} mt-4`}>SUPPORT EMAIL</label>
                    <input
                        type="email"
                        className={inputClass}
                        value={settings.supportEmail}
                        onChange={(event) =>
                            patch({ supportEmail: event.target.value })
                        }
                    />

                    <button
                        type="button"
                        disabled={saveSettings.isPending}
                        onClick={() => saveSettings.mutate({
                            storeName: settings.storeName,
                            supportEmail: settings.supportEmail,
                        })}
                        className="mt-4 flex w-full items-center justify-center gap-2 bg-second p-3 font-mono text-xs font-bold text-black disabled:opacity-50"
                    >
                        <Save className="size-4" /> SAVE CHANGES
                    </button>
                </section>

                {/* OPERATIONAL COUNTRIES */}
                <section className={panelClass}>
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h2 className="flex items-center gap-2 font-mono text-sm font-bold">
                                <Globe className="size-4" /> COUNTRY &amp; REGIONAL SETTINGS
                            </h2>
                            <p className="mt-1 font-mono text-xs text-white/50 light:text-main/50">
                                Countries, currency conversion and shipping.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={openAddCountry}
                            className="flex items-center gap-2 bg-second px-4 py-3 font-mono text-xs font-bold text-black"
                        >
                            <Plus className="size-4" /> ADD COUNTRY
                        </button>
                    </div>

                    {ratesQuery.isError && (
                        <p className="mb-3 text-xs text-red-400">
                            Exchange rates could not be loaded.
                        </p>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-190 border-collapse text-left font-mono text-[10px]">
                            <thead className="bg-white/5 text-white/60 light:text-main/60">
                                <tr>
                                    {[
                                        "#",
                                        "COUNTRY",
                                        "CURRENCY",
                                        "RATE (1 USD)",
                                        "SHIPPING (USD)",
                                        "FREE SHIPPING (USD)",
                                        "STATUS",
                                        "ACTIONS",
                                    ].map((heading) => (
                                        <th key={heading} className="border border-white/10 p-3">
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(countriesQuery.data ?? []).map((country, index) => (
                                    <tr key={country.id} className="hover:bg-white/5">
                                        <td className="border border-white/10 p-3">{index + 1}</td>
                                        <td className="border border-white/10 p-3">
                                            {country.name} ({country.code})
                                        </td>
                                        <td className="border border-white/10 p-3">
                                            {country.currencyCode} ({country.currencySymbol})
                                        </td>
                                        <td className="border border-white/10 p-3">
                                            {rates[country.currencyCode] !== undefined
                                                ? rates[country.currencyCode].toFixed(4)
                                                : ratesQuery.isPending
                                                    ? "Loading..."
                                                    : "N/A"}
                                        </td>
                                        <td className="border border-white/10 p-3">
                                            {country.currencySymbol}{country.shippingFeeUSD.toFixed(2)} USD
                                        </td>
                                        <td className="border border-white/10 p-3">
                                            {country.currencySymbol}{country.freeShippingThresholdUSD.toFixed(2)} USD
                                        </td>
                                        <td className="border border-white/10 p-3">
                                            <input
                                                type="checkbox"
                                                className="toggle toggle-success toggle-sm"
                                                checked={country.isActive}
                                                onChange={(event) =>
                                                    saveCountry.mutate({
                                                        id: country.id,
                                                        isActive: event.target.checked,
                                                    })
                                                }
                                            />
                                        </td>
                                        <td className="border border-white/10 p-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    title="Edit country"
                                                    onClick={() => openEditCountry(country)}
                                                    className="border border-white/15 p-2"
                                                >
                                                    <Pencil className="size-3" />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Delete country"
                                                    onClick={() => {
                                                        if (window.confirm(`Delete ${country.name}?`)) {
                                                            deleteCountry.mutate(country.id);
                                                        }
                                                    }}
                                                    className="border border-red-500/30 p-2 text-red-400"
                                                >
                                                    <Trash2 className="size-3" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!countriesQuery.isPending &&
                                    (countriesQuery.data?.length ?? 0) === 0 && (
                                        <tr>
                                            <td colSpan={8} className="p-6 text-center text-white/50">
                                                No countries configured yet.
                                            </td>
                                        </tr>
                                    )}
                            </tbody>
                        </table>
                    </div>

                    <p className="mt-3 font-mono text-[10px] text-white/50 light:text-main/50">
                        <Globe className="mr-1 inline size-3" />
                        Exchange rates are fetched from open.er-api.com and cached for one hour. Shipping values are stored in USD.
                    </p>
                </section>

                {/* ADMIN ACCOUNT INFORMATION */}
                <section className={`${panelClass} xl:col-span-2`}>
                    <h2 className="font-mono text-sm font-bold">ADMIN ACCOUNT</h2>
                    <p className="mt-2 font-mono text-xs text-white/50 light:text-main/50">
                        Account identity and permissions are managed by the authentication system.
                    </p>
                </section>
            </div>

            {/* ADD / EDIT COUNTRY MODAL */}
            {countryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4">
                    <section className="my-auto max-h-[95vh] w-full max-w-xl overflow-y-auto border border-white/25 bg-[#0b0f12] p-5 text-white shadow-2xl">
                        <header className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                            <div>
                                <h2 className="flex items-center gap-3 font-mono text-lg font-bold">
                                    <Globe className="size-6" />
                                    {editingCountry ? "EDIT COUNTRY" : "ADD COUNTRY"}
                                </h2>
                                <p className="mt-1 text-sm text-white/60">
                                    Country, currency and shipping settings.
                                </p>
                            </div>
                            <button
                                type="button"
                                title="Close modal"
                                onClick={() => setCountryModal(false)}
                            >
                                <X className="size-5" />
                            </button>
                        </header>

                        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <label className="sm:col-span-2">
                                <span className={labelClass}>COUNTRY NAME *</span>
                                <input
                                    className={inputClass}
                                    value={countryForm.name}
                                    onChange={(event) =>
                                        setCountryForm({
                                            ...countryForm,
                                            name: event.target.value,
                                        })
                                    }
                                    placeholder="Germany"
                                />
                            </label>

                            <label>
                                <span className={labelClass}>ISO COUNTRY CODE *</span>
                                <input
                                    maxLength={2}
                                    className={inputClass}
                                    value={countryForm.code}
                                    onChange={(event) =>
                                        setCountryForm({
                                            ...countryForm,
                                            code: event.target.value.toUpperCase(),
                                        })
                                    }
                                    placeholder="DE"
                                />
                            </label>

                            <label>
                                <span className={labelClass}>CURRENCY CODE *</span>
                                <input
                                    maxLength={3}
                                    className={inputClass}
                                    value={countryForm.currencyCode}
                                    onChange={(event) =>
                                        setCountryForm({
                                            ...countryForm,
                                            currencyCode: event.target.value.toUpperCase(),
                                        })
                                    }
                                    placeholder="EUR"
                                />
                            </label>

                            <label>
                                <span className={labelClass}>CURRENCY SYMBOL *</span>
                                <input
                                    className={inputClass}
                                    value={countryForm.currencySymbol}
                                    onChange={(event) =>
                                        setCountryForm({
                                            ...countryForm,
                                            currencySymbol: event.target.value,
                                        })
                                    }
                                    placeholder="€"
                                />
                            </label>

                            <label>
                                <span className={labelClass}>SHIPPING FEE (USD) *</span>
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    className={inputClass}
                                    value={countryForm.shippingFeeUSD}
                                    onChange={(event) =>
                                        setCountryForm({
                                            ...countryForm,
                                            shippingFeeUSD: Number(event.target.value),
                                        })
                                    }
                                />
                            </label>

                            <label className="sm:col-span-2">
                                <span className={labelClass}>FREE SHIPPING THRESHOLD (USD)</span>
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    className={inputClass}
                                    value={countryForm.freeShippingThresholdUSD}
                                    onChange={(event) =>
                                        setCountryForm({
                                            ...countryForm,
                                            freeShippingThresholdUSD: Number(event.target.value),
                                        })
                                    }
                                />
                            </label>

                            <label className="flex items-center gap-3 sm:col-span-2">
                                <input
                                    type="checkbox"
                                    className="toggle toggle-success h-6 w-11 rounded-full! border-none bg-[#2a2d30] light:bg-zinc-200 checked:bg-second"
                                    checked={countryForm.isActive}
                                    onChange={(event) =>
                                        setCountryForm({
                                            ...countryForm,
                                            isActive: event.target.checked,
                                        })
                                    }
                                />
                                Active
                            </label>
                        </div>

                        <footer className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
                            <button
                                type="button"
                                onClick={() => setCountryModal(false)}
                                className="border border-white/30 px-5 py-3 font-mono text-xs font-bold"
                            >
                                CANCEL
                            </button>
                            <button
                                type="button"
                                disabled={saveCountry.isPending}
                                onClick={submitCountry}
                                className="bg-second px-5 py-3 font-mono text-xs font-bold text-black disabled:opacity-50"
                            >
                                {saveCountry.isPending
                                    ? "SAVING..."
                                    : editingCountry
                                        ? "SAVE COUNTRY"
                                        : "ADD COUNTRY"}
                            </button>
                        </footer>
                    </section>
                </div>
            )}
        </main>
    );
}
