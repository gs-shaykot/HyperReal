"use client";
import { useEffect, useState } from "react";
import Countdown from "react-countdown";

type LaunchCountdownProps = {
    targetDate?: string | number | Date;
    storageKey?: string;
};

const DEFAULT_STORAGE_KEY = "hyperreal_upcoming_release_at";

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
        }

        const storedTarget = localStorage.getItem(storageKey);
        if (storedTarget) {
            const storedTimestamp = Number(storedTarget);
            if (Number.isFinite(storedTimestamp) && storedTimestamp > 0) {
                setResolvedTargetDate(storedTimestamp);
                return;
            }
        }

        setResolvedTargetDate(null);
    }, [targetDate, storageKey]);

    if (!resolvedTargetDate) {
        return null;
    }

    const renderer = ({ days, hours, minutes, seconds }: { days: number; hours: number; minutes: number; seconds: number }) => {
        return (
            <div className="flex gap-6">

                {/* DAYS */}
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-black flex items-center justify-center text-second text-4xl font-bold">
                        {String(days).padStart(2, "0")}
                    </div>
                    <p className="mt-2 text-zinc-900 light:text-white text-xs font-semibold tracking-widest">DAYS</p>
                </div>

                {/* HOURS */}
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-black flex items-center justify-center text-second text-4xl font-bold">
                        {String(hours).padStart(2, "0")}
                    </div>
                    <p className="mt-2 text-zinc-900 light:text-white text-xs font-semibold tracking-widest">HOURS</p>
                </div>

                {/* MINUTES */}
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-black flex items-center justify-center text-second text-4xl font-bold">
                        {String(minutes).padStart(2, "0")}
                    </div>
                    <p className="mt-2 text-zinc-900 light:text-white text-xs font-semibold tracking-widest">MINS</p>
                </div>

                {/* SECONDS */}
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-black flex items-center justify-center text-second text-4xl font-bold">
                        {String(seconds).padStart(2, "0")}
                    </div>
                    <p className="mt-2 text-zinc-900 light:text-white text-xs font-semibold tracking-widest">SECS</p>
                </div>

            </div>
        );
    };

    return (
        <Countdown date={resolvedTargetDate} renderer={renderer} />
    );
}