"use client";

import Marquee from "@/app/components/admin_component/settings/Marquee";
import UpcomingRelease from "@/app/components/admin_component/settings/UpcomingRelease";
import CountrySettings from "@/app/components/admin_component/settings/CountrySettings";

export default function AdminSettings() {
    return (
        <div className="mx-auto w-full max-w-400 space-y-5">
            <header className="mb-5">
                <h1 className="font-mono text-xl font-bold uppercase tracking-widest text-white">
                    Settings
                </h1>

                <p className="mt-1 font-mono text-xs text-zinc-400">
                    Store configuration &amp; preferences
                </p>
            </header>

            <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
                <Marquee />
                <UpcomingRelease />
            </div>

            <CountrySettings />
        </div>
    );
}
