
import { getStoreSettings } from "@/lib/storeSettings";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const settings = await getStoreSettings();

    return NextResponse.json(
        {
            storeName: settings.storeName,
            supportEmail: settings.supportEmail,
            showMarquee: settings.showMarquee,
            marqueeMessages: settings.marqueeMessages,
            marqueeScrollSpeed: settings.marqueeScrollSpeed,
            showUpcomingRelease: settings.showUpcomingRelease,
            releaseNameLine1: settings.releaseNameLine1,
            releaseNameLine2: settings.releaseNameLine2,
            releaseVersion: settings.releaseVersion,
            releaseDescription: settings.releaseDescription,
            releaseCountdownEnds: settings.releaseCountdownEnds,
            releaseButtonLabel: settings.releaseButtonLabel,
        },
        {
            headers: {
                "Cache-Control": "no-store",
            },
        }
    );
}
