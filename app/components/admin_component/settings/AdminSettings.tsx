"use client";
import Marquee from "@/app/components/admin_component/settings/Marquee";

export default function AdminSettings() {
    return (
        <div className="w-full max-w-3xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">
                    Store Settings
                </h1>
                <p className="mt-2 text-sm text-zinc-400">
                    Manage your storefront announcements and configuration.
                </p>
            </div>

            <Marquee />
        </div>
    );
}
