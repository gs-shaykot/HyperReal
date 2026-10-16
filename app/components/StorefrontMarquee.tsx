
"use client";

import { Megaphone } from "lucide-react";
import { useEffect, useState } from "react";

type MarqueeData = {
    messages: string[];
    isEnabled: boolean;
    scrollSpeed: number;
};

export default function StorefrontMarquee() {
    const [settings, setSettings] = useState<MarqueeData | null>(null);

    useEffect(() => {
        let active = true;

        async function loadMarquee() {
            try {
                const response = await fetch("/api/admin/settings/marquee", {
                    cache: "no-store",
                });

                if (!response.ok) return;

                const result = await response.json();

                if (active && result.success && result.data) {
                    setSettings({
                        messages: result.data.messages,
                        isEnabled: result.data.isEnabled,
                        scrollSpeed: result.data.scrollSpeed,
                    });
                }
            } catch (error) {
                console.error("Failed to load storefront marquee:", error);
            }
        }

        loadMarquee();

        return () => {
            active = false;
        };
    }, []);

    if (
        !settings?.isEnabled ||
        !settings.messages?.some((message) => message.trim())
    ) {
        return null;
    }

    const messages = settings.messages.filter((message) => message.trim());

    return (
        <div
            className="w-full overflow-hidden border-b border-black/10 bg-[#c8ff00] py-2 text-black"
            aria-label="Store announcements"
        >
            <div
                className="flex w-max items-center whitespace-nowrap motion-reduce:animate-none"
                style={{
                    animation: `storefront-marquee ${settings.scrollSpeed}s linear infinite`,
                }}
            >
                {[...messages, ...messages].map((message, index) => (
                    <p
                        key={`${index}-${message}`}
                        className="px-5 font-mono text-[10px] flex items-center font-bold uppercase tracking-[0.12em] sm:text-xs"
                    >
                        <span className="mr-2" aria-hidden="true">
                            <Megaphone size={14} />
                        </span>
                        {message}
                    </p>
                ))}
            </div>

            <style jsx>{`
                @keyframes storefront-marquee {
                    from {
                        transform: translateX(0);
                    }
                    to {
                        transform: translateX(-50%);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    div {
                        animation: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
