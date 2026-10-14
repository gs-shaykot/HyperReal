
import prisma from "@/lib/prisma";

export const defaultStoreSettings = {
    id: "default",
    storeName: "HYPERREAL",
    supportEmail: "support@hyperreal.store",
    showMarquee: true,
    marqueeMessages: [
        "FREE SHIPPING WORLDWIDE",
        "DROP 004 AVAILABLE NOW",
        "LIMITED STOCK",
    ],
    marqueeScrollSpeed: 45,
    showUpcomingRelease: true,
    releaseNameLine1: "VOID",
    releaseNameLine2: "RUNNER",
    releaseVersion: "V3",
    releaseDescription:
        "The next iteration of urban mobility. Featuring adaptive bio-mesh and enhanced kinetic absorption.",
    releaseCountdownEnds: null,
    releaseButtonLabel: "SET REMINDER",
};

export async function getStoreSettings() {
    try {
        return await prisma.storeSettings.upsert({
            where: { id: "default" },
            create: { id: "default" },
            update: {},
        });
    } catch (error) {
        console.error("Failed to load store settings:", error);
        return defaultStoreSettings;
    }
}
