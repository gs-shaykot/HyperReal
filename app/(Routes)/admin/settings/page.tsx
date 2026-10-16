
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

import CountryModal, {
    type CountryForm,
} from "@/app/components/admin_component/settings/CountryModal";

import { CountrySettings } from "@/app/components/admin_component/settings/CountrySettings";

import {
    CalendarDays,
    Megaphone,
    RotateCcw,
    Save,
    X,
} from "lucide-react";

import { useEffect, useState } from "react";

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

    useEffect(() => {
        if (settingsQuery.data) {
            setSettings(settingsQuery.data);
        }
    }, [settingsQuery.data]);

    const rates = ratesQuery.data ?? {};

    const patch = (values: Partial<StoreSettings>) => {
        setSettings((current) =>
            current ? { ...current, ...values } : current
        );
    };

    const openAddCountry = () => {
        setEditingCountry(null);
        setCountryModal(true);
    };

    const openEditCountry = (country: OperationalCountry) => {
        setEditingCountry(country);
        setCountryModal(true);
    };

    const closeCountryModal = () => {
        setCountryModal(false);
        setEditingCountry(null);
    };

    const submitCountry = (form: CountryForm) => {
        saveCountry.mutate(
            {
                ...form,
                ...(editingCountry ? { id: editingCountry.id } : {}),
            },
            {
                onSuccess: () => {
                    closeCountryModal();
                },
            }
        );
    };

    if (settingsQuery.isPending || !settings) {
        return (
            <main className="min-h-screen bg-main p-6 font-mono text-sm text-white light:bg-white light:text-main">
                Loading settings...
            </main>
        );
    }

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
                            <Megaphone className="size-4" />
                            HOMEPAGE MARQUEE
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
                                patch({
                                    showMarquee: event.target.checked,
                                })
                            }
                        />
                    </label>

                    <label className={`${labelClass} mt-4`}>
                        MESSAGES
                    </label>

                    <div className="space-y-2">
                        {settings.marqueeMessages.map((message, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    className={inputClass}
                                    value={message}
                                    onChange={(event) =>
                                        patch({
                                            marqueeMessages:
                                                settings.marqueeMessages.map(
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
                        + ADD MESSAGE
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
                        className="range range-success range-xs h-2.5 w-full"
                    />

                    <div className="mt-4 bg-second p-3 font-mono text-xs font-bold text-black">
                        <Megaphone className="mr-2 inline size-4" />
                        {settings.marqueeMessages.join("  ◆  ")}
                    </div>

                    <button
                        type="button"
                        disabled={saveSettings.isPending}
                        onClick={() =>
                            saveSettings.mutate({
                                showMarquee: settings.showMarquee,
                                marqueeMessages: settings.marqueeMessages,
                                marqueeScrollSpeed: settings.marqueeScrollSpeed,
                            })
                        }
                        className="mt-3 flex w-full items-center justify-center gap-2 bg-second p-3 font-mono text-xs font-bold text-black disabled:opacity-50"
                    >
                        <Save className="size-4" />
                        SAVE MARQUEE
                    </button>
                </section>

                {/* UPCOMING RELEASE */}
                <section className={panelClass}>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 font-mono text-sm font-bold">
                            <CalendarDays className="size-4" />
                            UPCOMING RELEASE
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
                                        patch({
                                            [field]: event.target.value,
                                        })
                                    }
                                />
                            </label>
                        ))}
                    </div>

                    <label className={`${labelClass} mt-4`}>
                        DESCRIPTION
                    </label>

                    <textarea
                        rows={3}
                        className={inputClass}
                        value={settings.releaseDescription}
                        onChange={(event) =>
                            patch({
                                releaseDescription: event.target.value,
                            })
                        }
                    />

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <label>
                            <span className={labelClass}>
                                COUNTDOWN ENDS
                            </span>

                            <input
                                type="datetime-local"
                                className={inputClass}
                                value={
                                    settings.releaseCountdownEnds
                                        ? new Date(
                                              settings.releaseCountdownEnds
                                          )
                                              .toISOString()
                                              .slice(0, 16)
                                        : ""
                                }
                                onChange={(event) =>
                                    patch({
                                        releaseCountdownEnds: event.target.value
                                            ? new Date(
                                                  event.target.value
                                              ).toISOString()
                                            : null,
                                    })
                                }
                            />
                        </label>

                        <label>
                            <span className={labelClass}>
                                BUTTON LABEL
                            </span>

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
                        onClick={() =>
                            saveSettings.mutate({
                                showUpcomingRelease:
                                    settings.showUpcomingRelease,
                                releaseNameLine1: settings.releaseNameLine1,
                                releaseNameLine2: settings.releaseNameLine2,
                                releaseVersion: settings.releaseVersion,
                                releaseDescription: settings.releaseDescription,
                                releaseCountdownEnds:
                                    settings.releaseCountdownEnds,
                                releaseButtonLabel: settings.releaseButtonLabel,
                            })
                        }
                        className="mt-3 flex w-full items-center justify-center gap-2 bg-second p-3 font-mono text-xs font-bold text-black disabled:opacity-50"
                    >
                        <Save className="size-4" />
                        SAVE RELEASE
                    </button>
                </section>

                {/* COUNTRY & SHIPPING SETTINGS */}
                <section className="xl:col-span-2">
                    <CountrySettings
                        countries={countriesQuery.data ?? []}
                        isLoading={countriesQuery.isPending}
                        isRefreshingRates={ratesQuery.isFetching}
                        deletingCountryId={
                            deleteCountry.isPending
                                ? deleteCountry.variables
                                : null
                        }
                        onAddAction={openAddCountry}
                        onEditAction={(country) =>
                            openEditCountry(country)
                        }
                        onDeleteAction={(id) =>
                            deleteCountry.mutate(id)
                        }
                        onToggleStatusAction={(country) =>
                            saveCountry.mutate({
                                ...country,
                                isActive: !country.isActive,
                            })
                        }
                        onRefreshRatesAction={() =>
                            ratesQuery.refetch()
                        }
                    />

                    {ratesQuery.isError && (
                        <p className="mt-2 font-mono text-xs text-red-400">
                            Exchange rates could not be loaded. Please try
                            refreshing them.
                        </p>
                    )}

                    {countriesQuery.isError && (
                        <p className="mt-2 font-mono text-xs text-red-400">
                            Operational countries could not be loaded.
                        </p>
                    )}
                </section>

                {/* ADMIN ACCOUNT */}
                <section className={`${panelClass} xl:col-span-2`}>
                    <h2 className="font-mono text-sm font-bold">
                        ADMIN ACCOUNT
                    </h2>

                    <p className="mt-2 font-mono text-xs text-white/50 light:text-main/50">
                        Account identity and permissions are managed by the
                        authentication system.
                    </p>
                </section>
            </div>

            {/* SEPARATE COUNTRY MODAL */}
            <CountryModal
                open={countryModal}
                country={editingCountry}
                existingCountries={countriesQuery.data ?? []}
                exchangeRates={rates}
                isPending={saveCountry.isPending}
                isRefreshingRates={ratesQuery.isFetching}
                onCloseAction={closeCountryModal}
                onSubmitAction={submitCountry}
                onRefreshRatesAction={() => ratesQuery.refetch()}
            />
        </main>
    );
}
