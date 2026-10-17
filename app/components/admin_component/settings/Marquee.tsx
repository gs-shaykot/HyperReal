
"use client";

import { useEffect, useState } from "react";
import { Plus, RotateCcw, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import {
    type MarqueeSettings,
    useAdminMarquee,
    useSaveAdminMarquee,
} from "@/app/Hooks/useAdminMarquee";

const DEFAULT_MESSAGES = [
    "FREE SHIPPING WORLDWIDE",
    "DROP 004 AVAILABLE NOW",
    "LIMITED STOCK",
];

const DEFAULT_SETTINGS: MarqueeSettings = {
    id: "homepage",
    messages: DEFAULT_MESSAGES,
    isEnabled: true,
    scrollSpeed: 45,
};

export default function Marquee() {
    const { data, isLoading, isError, refetch } = useAdminMarquee();
    const saveMutation = useSaveAdminMarquee();

    const [settings, setSettings] =
        useState<MarqueeSettings>(DEFAULT_SETTINGS);

    useEffect(() => {
        if (data) setSettings(data);
    }, [data]);

    const updateSettings = (changes: Partial<MarqueeSettings>) => {
        setSettings((current) => ({ ...current, ...changes }));
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
        if (settings.messages.length >= 10) {
            toast.error("You can add up to 10 messages.");
            return;
        }

        updateSettings({
            messages: [...settings.messages, ""],
        });
    };

    const removeMessage = (index: number) => {
        updateSettings({
            messages: settings.messages.filter((_, i) => i !== index),
        });
    };

    const resetChanges = () => {
        setSettings(data ?? DEFAULT_SETTINGS);
    };

    const saveChanges = () => {
        if (settings.messages.some((message) => !message.trim())) {
            toast.error("Fill in or remove empty messages.");
            return;
        }

        saveMutation.mutate({
            ...settings,
            messages: settings.messages.map((message) => message.trim()),
        });
    };

    if (isLoading) {
        return (
            <section className="border border-zinc-800 bg-[#0b0b0b] p-5 text-sm text-zinc-400">
                Loading marquee settings...
            </section>
        );
    }

    if (isError && !data) {
        return (
            <section className="border border-zinc-800 bg-[#0b0b0b] p-5">
                <p className="text-sm text-red-400">
                    Could not load marquee settings.
                </p>
                <button
                    type="button"
                    onClick={() => refetch()}
                    className="mt-3 border border-zinc-700 px-4 py-2 text-xs text-white hover:border-[#c8ff00]"
                >
                    Retry
                </button>
            </section>
        );
    }

    return (
        <section className="min-w-0 border border-[#292929] bg-[#0b0b0b] p-4 text-white sm:p-4.25">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider">
                    Homepage Marquee
                </h2>

                <button
                    type="button"
                    onClick={resetChanges}
                    disabled={saveMutation.isPending}
                    title="Reset changes"
                    aria-label="Reset marquee changes"
                    className="text-zinc-500 transition hover:text-[#c8ff00] disabled:opacity-50"
                >
                    <RotateCcw size={14} />
                </button>
            </div>

            <div className="mb-4 flex items-center justify-between">
                <label
                    htmlFor="marquee-enabled"
                    className="font-mono text-[11px] uppercase tracking-wider text-zinc-300"
                >
                    Show marquee
                </label>

                <button
                    id="marquee-enabled"
                    type="button"
                    role="switch"
                    aria-checked={settings.isEnabled}
                    onClick={() =>
                        updateSettings({ isEnabled: !settings.isEnabled })
                    }
                    className={`relative h-4.5 w-8 border border-[#c8ff00] rounded-full cursor-pointer transition ${
                        settings.isEnabled ? "bg-[#c8ff00]" : "bg-transparent"
                    }`}
                >
                    <span
                        className={`absolute top-0.5 h-3 w-3 bg-black transition-all rounded-full! {
                            settings.isEnabled ? "left-3.75" : "left-0.5"
                        }`}
                    />
                </button>
            </div>

            <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                Messages
            </div>

            <div className="space-y-1.5">
                {settings.messages.map((message, index) => (
                    <div key={index} className="flex min-w-0 gap-1.5">
                        <input
                            value={message}
                            maxLength={200}
                            onChange={(event) =>
                                updateMessage(index, event.target.value)
                            }
                            aria-label={`Marquee message ${index + 1}`}
                            placeholder="Enter announcement"
                            className="h-9.5 min-w-0 flex-1 border border-[#292929] bg-transparent px-3 font-mono text-xs text-white outline-none placeholder:text-zinc-600 focus:border-[#c8ff00]"
                        />

                        <button
                            type="button"
                            onClick={() => removeMessage(index)}
                            aria-label={`Remove message ${index + 1}`}
                            className="flex h-9.5 w-9.5 shrink-0 items-center justify-center border border-[#292929] text-zinc-300 hover:border-red-500 hover:text-red-400"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={addMessage}
                disabled={settings.messages.length >= 10}
                className="mt-2 cursor-pointer flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#c8ff00] hover:text-white disabled:opacity-40"
            >
                <Plus size={13} />
                Add Message
            </button>

            <div className="mb-2 mt-5 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                Scroll speed — {settings.scrollSpeed}s per loop
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
                className="mb-5 h-1 w-full cursor-pointer accent-[#c8ff00]"
            />

            <div className="mb-4 overflow-hidden border border-[#292929]">
                <div className="overflow-hidden bg-[#c8ff00] py-2.25 text-black">
                    {settings.isEnabled && settings.messages.length > 0 ? (
                        <div
                            className="flex w-max whitespace-nowrap"
                            style={{
                                animation: `admin-marquee-preview ${settings.scrollSpeed}s linear infinite`,
                            }}
                        >
                            {[...settings.messages, ...settings.messages].map(
                                (message, index) => (
                                    <span
                                        key={`${index}-${message}`}
                                        className="px-3 font-mono text-[9px] font-bold uppercase tracking-wider"
                                    >
                                        {message || "ANNOUNCEMENT"}
                                        <span className="ml-4">◆</span>
                                    </span>
                                )
                            )}
                        </div>
                    ) : (
                        <p className="px-3 text-center font-mono text-[9px] font-bold uppercase">
                            {settings.isEnabled
                                ? "Add a message to preview"
                                : "Marquee is disabled"}
                        </p>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes admin-marquee-preview {
                    from {
                        transform: translateX(0);
                    }
                    to {
                        transform: translateX(-50%);
                    }
                }
            `}</style>

            <button
                type="button"
                onClick={saveChanges}
                disabled={saveMutation.isPending}
                className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 bg-[#c8ff00] font-mono text-[10px] font-bold uppercase tracking-wider text-black transition hover:bg-[#b4e900] disabled:cursor-not-allowed disabled:opacity-50"
            >
                <Save size={13} />
                {saveMutation.isPending ? "Saving..." : "Save Marquee"}
            </button>
        </section>
    );
}
