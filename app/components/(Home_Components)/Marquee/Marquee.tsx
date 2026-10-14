
"use client";

import { Megaphone } from "lucide-react";
import { useEffect, useState } from "react";

type MarqueeSettings = {
    showMarquee: boolean;
    marqueeMessages: string[];
    marqueeScrollSpeed: number;
};

export function Marquee() {
    const [settings, setSettings] = useState<MarqueeSettings | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        fetch("/api/store-settings", {
            signal: controller.signal,
            cache: "no-store",
        })
            .then((response) => {
                if (!response.ok) throw new Error("Settings unavailable");
                return response.json();
            })
            .then((data) => setSettings(data))
            .catch((error: unknown) => {
                if (error instanceof Error && error.name === "AbortError") return;
                console.error("Unable to load marquee settings:", error);
            });

        return () => controller.abort();
    }, []);

    if (!settings?.showMarquee) return null;

    const messages = settings.marqueeMessages.filter(
        (message) => message.trim().length > 0
    );

    if (!messages.length) return null;

    const duration = Math.min(120, Math.max(10, settings.marqueeScrollSpeed));

    return (
        <div className="overflow-hidden border-b border-zinc-800 bg-second text-black light:border-zinc-300">
            <div
                className="flex w-max items-center py-2 font-mono text-xs font-bold motion-safe:animate-none"
                style={{
                    animation: `hyperreal-marquee ${duration}s linear infinite`,
                }}
            >
                {[0, 1].map((copy) => (
                    <div
                        key={copy}
                        aria-hidden={copy === 1}
                        className="flex shrink-0 items-center"
                    >
                        {messages.map((message, index) => (
                            <span
                                key={`${copy}-${index}`}
                                className="mx-5 flex items-center gap-2 whitespace-nowrap"
                            >
                                <Megaphone className="size-3 shrink-0" />
                                {message}
                                <span aria-hidden="true">◆</span>
                            </span>
                        ))}
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes hyperreal-marquee {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }

                @media (prefers-reduced-motion: reduce) {
                    div[style] { animation: none !important; }
                }
            `}</style>
        </div>
    );
}
