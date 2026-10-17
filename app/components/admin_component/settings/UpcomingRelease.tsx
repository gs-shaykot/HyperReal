
"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import toast from "react-hot-toast";
import {
    DEFAULT_UPCOMING_RELEASE,
    type UpcomingReleaseSettings,
    useAdminUpcomingRelease,
    useSaveAdminUpcomingRelease,
} from "@/app/Hooks/useAdminUpcomingRelease";

function toDateTimeLocal(value: string | null | undefined) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const offset = date.getTimezoneOffset() * 60_000;

    return new Date(date.getTime() - offset)
        .toISOString()
        .slice(0, 16);
}

function toLocalISOString(value: string) {
    if (!value) return null;

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

const inputClass =
    "h-[38px] w-full min-w-0 border border-[#292929] bg-transparent px-3 font-mono text-xs text-white outline-none focus:border-[#c8ff00]";

const labelClass =
    "mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-zinc-400";

export default function UpcomingRelease() {
    const { data, isLoading, isError, refetch } =
        useAdminUpcomingRelease();

    const saveMutation = useSaveAdminUpcomingRelease();

    const [settings, setSettings] =
        useState<UpcomingReleaseSettings>(DEFAULT_UPCOMING_RELEASE);

    const [countdownInput, setCountdownInput] = useState("");

    useEffect(() => {
        if (!data) return;

        setSettings(data);
        setCountdownInput(toDateTimeLocal(data.countdownEnds));
    }, [data]);

    const updateSettings = (
        changes: Partial<UpcomingReleaseSettings>
    ) => {
        setSettings((current) => ({ ...current, ...changes }));
    };

    const resetChanges = () => {
        const original = data ?? DEFAULT_UPCOMING_RELEASE;

        setSettings(original);
        setCountdownInput(toDateTimeLocal(original.countdownEnds));
    };

    const saveChanges = () => {
        if (
            !settings.nameLine1.trim() ||
            !settings.nameLine2.trim() ||
            !settings.version.trim() ||
            !settings.description.trim() ||
            !settings.buttonLabel.trim()
        ) {
            toast.error("Please fill in all release fields.");
            return;
        }

        if (countdownInput && !toLocalISOString(countdownInput)) {
            toast.error("Please choose a valid countdown date.");
            return;
        }

        saveMutation.mutate({
            ...settings,
            nameLine1: settings.nameLine1.trim(),
            nameLine2: settings.nameLine2.trim(),
            version: settings.version.trim(),
            description: settings.description.trim(),
            buttonLabel: settings.buttonLabel.trim(),
            countdownEnds: toLocalISOString(countdownInput),
        });
    };

    if (isLoading) {
        return (
            <section className="border border-[#292929] bg-[#0b0b0b] p-4 text-sm text-zinc-400">
                Loading upcoming release settings...
            </section>
        );
    }

    if (isError && !data) {
        return (
            <section className="border border-[#292929] bg-[#0b0b0b] p-4">
                <p className="text-sm text-red-400">
                    Could not load upcoming release settings.
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
        <section className="min-w-0 border border-[#292929] bg-[#0b0b0b] p-4 text-white">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider">
                    Upcoming Release
                </h2>

                <button
                    type="button"
                    onClick={resetChanges}
                    disabled={saveMutation.isPending}
                    title="Reset changes"
                    aria-label="Reset release changes"
                    className="text-zinc-500 transition hover:text-[#c8ff00] disabled:opacity-50"
                >
                    <RotateCcw size={14} />
                </button>
            </div>

            <div className="mb-4 flex items-center justify-between">
                <label
                    htmlFor="release-enabled"
                    className="font-mono text-[11px] uppercase tracking-wider text-zinc-300"
                >
                    Show section
                </label>

                <button
                    id="release-enabled"
                    type="button"
                    role="switch"
                    aria-checked={settings.isEnabled}
                    onClick={() =>
                        updateSettings({
                            isEnabled: !settings.isEnabled,
                        })
                    }
                    className={`relative h-4.5 w-8 border rounded-full! border-[#c8ff00] transition ${
                        settings.isEnabled
                            ? "bg-[#c8ff00]"
                            : "bg-transparent"
                    }`}
                >
                    <span
                        className={`absolute top-0.5 h-3 w-3 rounded-full! bg-black transition-all ${
                            settings.isEnabled ? "left-3.75" : "left-0.5"
                        }`}
                    />
                </button>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="min-w-0">
                    <label htmlFor="release-name-line-1" className={labelClass}>
                        Name line 1
                    </label>
                    <input
                        id="release-name-line-1"
                        value={settings.nameLine1}
                        maxLength={80}
                        onChange={(event) =>
                            updateSettings({ nameLine1: event.target.value })
                        }
                        className={inputClass}
                    />
                </div>

                <div className="min-w-0">
                    <label htmlFor="release-name-line-2" className={labelClass}>
                        Name line 2
                    </label>
                    <input
                        id="release-name-line-2"
                        value={settings.nameLine2}
                        maxLength={80}
                        onChange={(event) =>
                            updateSettings({ nameLine2: event.target.value })
                        }
                        className={inputClass}
                    />
                </div>

                <div className="min-w-0">
                    <label htmlFor="release-version" className={labelClass}>
                        Version
                    </label>
                    <input
                        id="release-version"
                        value={settings.version}
                        maxLength={30}
                        onChange={(event) =>
                            updateSettings({ version: event.target.value })
                        }
                        className={inputClass}
                    />
                </div>
            </div>

            <div className="mt-4">
                <label htmlFor="release-description" className={labelClass}>
                    Description
                </label>
                <textarea
                    id="release-description"
                    value={settings.description}
                    maxLength={1000}
                    rows={3}
                    onChange={(event) =>
                        updateSettings({ description: event.target.value })
                    }
                    className="w-full min-h-16.5 resize-y border border-[#292929] bg-transparent px-3 py-3 font-mono text-xs leading-5 text-white outline-none focus:border-[#c8ff00]"
                />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="min-w-0">
                    <label htmlFor="release-countdown" className={labelClass}>
                        Countdown ends
                    </label>
                    <input
                        id="release-countdown"
                        type="datetime-local"
                        value={countdownInput}
                        onChange={(event) =>
                            setCountdownInput(event.target.value)
                        }
                        className={`${inputClass} scheme-dark`}
                    />
                </div>

                <div className="min-w-0">
                    <label htmlFor="release-button-label" className={labelClass}>
                        Button label
                    </label>
                    <input
                        id="release-button-label"
                        value={settings.buttonLabel}
                        maxLength={60}
                        onChange={(event) =>
                            updateSettings({ buttonLabel: event.target.value })
                        }
                        className={inputClass}
                    />
                </div>
            </div>

            <button
                type="button"
                onClick={saveChanges}
                disabled={saveMutation.isPending}
                className="mt-4 flex h-10 w-full items-center justify-center gap-2 bg-[#c8ff00] font-mono text-[10px] font-bold uppercase tracking-wider text-black transition hover:bg-[#b4e900] disabled:cursor-not-allowed disabled:opacity-50"
            >
                <Save size={13} />
                {saveMutation.isPending ? "Saving..." : "Save Release"}
            </button>
        </section>
    );
}
