
"use client";

import { useEffect, useState } from "react";
import {
    Plus,
    RotateCcw,
    Save,
    Trash2,
    Megaphone,
    Eye,
} from "lucide-react";
import {
    MarqueeSettings,
    useAdminMarquee,
    useSaveAdminMarquee,
} from "@/app/Hooks/useAdminMarquee";

const initialMessages = [
    "FREE SHIPPING WORLDWIDE",
    "DROP 004 AVAILABLE NOW",
    "LIMITED STOCK",
];

const defaultSettings: MarqueeSettings = {
    id: "homepage",
    messages: initialMessages,
    isEnabled: true,
    scrollSpeed: 45,
};

export default function Marquee() {
    const { data, isLoading, isError, refetch } = useAdminMarquee();
    const saveMutation = useSaveAdminMarquee();

    const [settings, setSettings] =
        useState<MarqueeSettings>(defaultSettings);

    useEffect(() => {
        if (data) {
            setSettings(data);
        }
    }, [data]);

    const updateSettings = (
        changes: Partial<MarqueeSettings>
    ) => {
        setSettings((current) => ({
            ...current,
            ...changes,
        }));
    };

    const updateMessage = (index: number, value: string) => {
        setSettings((current) => ({
            ...current,
            messages: current.messages.map((message, i) =>
                i === index ? value : message
            ),
        }));
    };

    const addMessage = () => {
        if (settings.messages.length >= 10) return;

        updateSettings({
            messages: [...settings.messages, ""],
        });
    };

    const removeMessage = (index: number) => {
        updateSettings({
            messages: settings.messages.filter(
                (_, i) => i !== index
            ),
        });
    };

    const handleReset = () => {
        if (data) {
            setSettings(data);
        } else {
            setSettings(defaultSettings);
        }
    };

    const handleSave = () => {
        if (settings.messages.some((message) => !message.trim())) {
            import("react-hot-toast").then(({ default: toast }) => {
                toast.error("Please fill in or remove empty messages.");
            });
            return;
        }

        saveMutation.mutate({
            ...settings,
            messages: settings.messages.map((message) =>
                message.trim()
            ),
        });
    };

    if (isLoading) {
        return (
            <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-400">
                Loading marquee settings...
            </section>
        );
    }

    if (isError && !data) {
        return (
            <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                <p className="text-sm text-red-400">
                    Could not load marquee settings.
                </p>
                <button
                    onClick={() => refetch()}
                    className="mt-4 rounded-lg bg-lime-300 px-4 py-2 text-sm font-semibold text-black"
                >
                    Try Again
                </button>
            </section>
        );
    }

    return (
        <section className="space-y-6 border border-zinc-800 bg-zinc-950 text-white sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-lime-300/10 p-3 text-lime-300">
                        <Megaphone size={22} />
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold">
                            Homepage Marquee
                        </h2>
                        <p className="mt-1 text-sm text-zinc-400">
                            Manage the announcement bar displayed across your store.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        updateSettings({
                            isEnabled: !settings.isEnabled,
                        })
                    }
                    aria-pressed={settings.isEnabled}
                    className={`flex items-center gap-3 rounded-full border px-3 py-2 text-sm ${settings.isEnabled
                            ? "border-lime-300/30 text-lime-300"
                            : "border-zinc-700 text-zinc-400"
                        }`}
                >
                    <span>
                        {settings.isEnabled ? "Enabled" : "Disabled"}
                    </span>

                    <span
                        className={`relative h-5 w-9 rounded-full transition ${settings.isEnabled
                                ? "bg-lime-300"
                                : "bg-zinc-700"
                            }`}
                    >
                        <span
                            className={`absolute top-0.5 h-4 w-4 rounded-full bg-black transition ${settings.isEnabled
                                    ? "left-4.5"
                                    : "left-0.5"
                                }`}
                        />
                    </span>
                </button>
            </div>

            <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="font-medium">Announcement messages</h3>
                        <p className="mt-1 text-xs text-zinc-500">
                            Up to 10 messages, maximum 200 characters each.
                        </p>
                    </div>

                    <span className="text-xs text-zinc-500">
                        {settings.messages.length}/10
                    </span>
                </div>

                <div className="space-y-3">
                    {settings.messages.map((message, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2"
                        >
                            <span className="w-6 shrink-0 text-xs text-zinc-500">
                                {String(index + 1).padStart(2, "0")}
                            </span>

                            <input
                                value={message}
                                maxLength={200}
                                onChange={(event) =>
                                    updateMessage(index, event.target.value)
                                }
                                aria-label={`Announcement message ${index + 1}`}
                                placeholder="Enter announcement text"
                                className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm outline-none transition focus:border-lime-300"
                            />

                            <button
                                type="button"
                                onClick={() => removeMessage(index)}
                                aria-label={`Remove message ${index + 1}`}
                                className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-400/10 hover:text-red-400"
                            >
                                <Trash2 size={17} />
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={addMessage}
                    disabled={settings.messages.length >= 10}
                    className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 transition hover:border-lime-300 hover:text-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Plus size={16} />
                    Add Message
                </button>
            </div>

            <div className="rounded-xl border border-zinc-800 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h3 className="font-medium">Scroll speed</h3>
                        <p className="mt-1 text-xs text-zinc-500">
                            Lower values scroll slower.
                        </p>
                    </div>

                    <span className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm font-medium text-lime-300">
                        {settings.scrollSpeed}
                    </span>
                </div>

                <input
                    type="range"
                    min={15}
                    max={120}
                    step={5}
                    value={settings.scrollSpeed}
                    onChange={(event) =>
                        updateSettings({
                            scrollSpeed: Number(event.target.value),
                        })
                    }
                    aria-label="Marquee scroll speed"
                    className="mt-5 w-full accent-lime-300"
                />

                <div className="mt-2 flex justify-between text-xs text-zinc-500">
                    <span>Slow</span>
                    <span>Fast</span>
                </div>
            </div>

            <div className="overflow-hidden border border-zinc-800">
                <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900 px-4 py-3">
                    <Eye size={16} className="text-lime-300" />
                    <span className="text-sm font-medium">Preview</span>
                    <span className="ml-auto text-xs text-zinc-500">
                        {settings.isEnabled ? "Visible on store" : "Disabled"}
                    </span>
                </div>

                <div className="overflow-hidden bg-lime-300 py-3 text-black">
                    {settings.isEnabled && settings.messages.length > 0 ? (
                        <div
                            className="flex w-max items-center whitespace-nowrap"
                            style={{
                                animation: `homepage-marquee ${Math.max(
                                    8,
                                    settings.scrollSpeed
                                )}s linear infinite`,
                            }}
                        >
                            {[...settings.messages, ...settings.messages].map(
                                (message, index) => (
                                    <span
                                        key={`${index}-${message}`}
                                        className="px-5 text-xs font-bold tracking-widest sm:text-sm"
                                    >
                                        {message || "YOUR ANNOUNCEMENT"}
                                        <span className="ml-10">✳</span>
                                    </span>
                                )
                            )}
                        </div>
                    ) : (
                        <p className="px-4 text-center text-sm font-medium">
                            {settings.isEnabled
                                ? "Add a message to preview the marquee."
                                : "Marquee is disabled."}
                        </p>
                    )}
                </div>

                <style jsx>{`
                    @keyframes homepage-marquee {
                        from {
                            transform: translateX(0);
                        }
                        to {
                            transform: translateX(-50%);
                        }
                    }
                `}</style>
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-zinc-800 pt-5">
                <button
                    type="button"
                    onClick={handleReset}
                    disabled={saveMutation.isPending}
                    className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
                >
                    <RotateCcw size={16} />
                    Reset Changes
                </button>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className="flex items-center gap-2 rounded-lg bg-lime-300 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Save size={16} />
                    {saveMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </section>
    );
}
