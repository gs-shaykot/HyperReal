"use client";
import { useEffect, useState } from "react";
import Countdown from "react-countdown";

type LaunchCountdownProps = {
    targetDate?: string | number | Date;
    storageKey?: string;
};

const DEFAULT_STORAGE_KEY = "hyperreal_upcoming_release_at";
const DEFAULT_TARGET_DATE = "2026-04-29T00:00:00";

const parseTargetDate = (value?: string | number | Date): number | null => {
    if (!value) return null;

    const parsed = value instanceof Date ? value.getTime() : new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : null;
};

export default function LaunchCountdown({ targetDate, storageKey = DEFAULT_STORAGE_KEY }: LaunchCountdownProps) {

    const [resolvedTargetDate, setResolvedTargetDate] = useState<number | null>(null);

    useEffect(() => {
        const parsedFromProp = parseTargetDate(targetDate);
        if (parsedFromProp) {
            localStorage.setItem(storageKey, String(parsedFromProp));
            setResolvedTargetDate(parsedFromProp);
            return;
        };

        const storedTarget = localStorage.getItem(storageKey);
        if (storedTarget) {
            const storedTimestamp = Number(storedTarget);
            if (Number.isFinite(storedTimestamp) && storedTimestamp > 0) {
                setResolvedTargetDate(storedTimestamp);
                return;
            }
        }

        const fallbackTimestamp = parseTargetDate(DEFAULT_TARGET_DATE);
        if (fallbackTimestamp) {
            localStorage.setItem(storageKey, String(fallbackTimestamp));
            setResolvedTargetDate(fallbackTimestamp);
        }
    }, [targetDate, storageKey]);

    if (!resolvedTargetDate) {
        return null;
    }

    const renderer = ({ days, hours, minutes, seconds }: { days: number; hours: number; minutes: number; seconds: number }) => {
        const items = [
            { label: "DAYS", value: days },
            { label: "HOURS", value: hours },
            { label: "MINS", value: minutes },
            { label: "SECS", value: seconds },
        ];

        return (
            <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4 md:gap-6">

                {items.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center">

                        <div className="
                        w-16 h-16 
                        sm:w-20 sm:h-20 
                        md:w-24 md:h-24 
                        bg-black flex items-center justify-center 
                        text-lime-400 
                        text-xl sm:text-2xl md:text-4xl 
                        font-bold
                    ">
                            {String(item.value).padStart(2, "0")}
                        </div>

                        <p className="mt-1 sm:mt-2 text-zinc-900 text-[10px] sm:text-xs font-semibold tracking-widest">
                            {item.label}
                        </p>
                    </div>
                ))}

            </div>
        );
    };

    return (
        <Countdown date={resolvedTargetDate} renderer={renderer} />
    );
}