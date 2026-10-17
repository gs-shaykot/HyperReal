
import prisma from "@/lib/prisma";
import LaunchCountdown from "@/app/components/(Home_Components)/Upcoming/CustomCountdown";

export const dynamic = "force-dynamic";

export const Upcoming = async () => {
    const release = await prisma.upcomingRelease.findUnique({
        where: { id: "homepage" },
    });

    // Use defaults until the admin settings have been saved for the first time.
    const settings = release ?? {
        isEnabled: true,
        nameLine1: "Void",
        nameLine2: "Runner",
        version: "V3",
        description: "The next iteration of urban mobility.",
        countdownEnds: null,
        buttonLabel: "Set Reminder",
    };

    // The admin can hide the entire homepage release section.
    if (!settings.isEnabled) {
        return null;
    }

    const releaseName = [
        settings.nameLine1.trim(),
        settings.nameLine2.trim(),
        settings.version.trim(),
    ].filter(Boolean);

    return (
        <section className="flex w-full items-center justify-center bg-second py-10">
            <div className="mx-auto grid h-full w-full max-w-7xl grid-cols-1 gap-5 px-4 md:grid-cols-2">
                <div className="flex flex-col items-start justify-center space-y-3">
                    <div className="flex w-36 items-center justify-between bg-black px-2 text-xs text-white">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                        <h2>UPCOMING RELEASE</h2>
                    </div>

                    <h1 className="font-inter! text-5xl font-bold sm:text-6xl lg:text-7xl">
                        {releaseName.map((word, index) => (
                            <span
                                key={`${word}-${index}`}
                                className={`block ${
                                    index === releaseName.length - 1
                                        ? "italic stroke-second"
                                        : "text-zinc-900"
                                }`}
                            >
                                {word.toUpperCase()}
                            </span>
                        ))}
                    </h1>

                    <p className="w-10/12 font-bold text-zinc-900">
                        {settings.description}
                    </p>

                    <button
                        type="button"
                        className="cursor-pointer border-2 border-black bg-black px-8 py-4 font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:bg-white hover:text-black hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none"
                    >
                        {settings.buttonLabel}
                    </button>
                </div>

                <div className="flex items-center justify-center">
                    {settings.countdownEnds && (
                        <LaunchCountdown
                            targetDate={settings.countdownEnds.toISOString()}
                        />
                    )}
                </div>
            </div>
        </section>
    );
};
