
import { getStoreSettings } from "@/lib/storeSettings";
import { Megaphone } from "lucide-react";

export async function Marquee() {
    const settings = await getStoreSettings();

    if (!settings.showMarquee || settings.marqueeMessages.length === 0) {
        return null;
    }

    const messages = settings.marqueeMessages.filter(
        (message) => message.trim().length > 0
    );

    if (messages.length === 0) return null;

    const duration = Math.min(
        120,
        Math.max(10, settings.marqueeScrollSpeed)
    );

    return (
        <div className="overflow-hidden border-b border-zinc-800 bg-second text-black light:border-zinc-300">
            <div
                className="flex w-max items-center py-2 font-mono text-xs font-bold"
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

            <style>{`
                @keyframes hyperreal-marquee {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .marquee-motion { animation: none; }
                }
            `}</style>
        </div>
    );
}
