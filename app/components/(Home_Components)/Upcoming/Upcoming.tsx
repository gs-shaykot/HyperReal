
import LaunchCountdown from "@/app/components/(Home_Components)/Upcoming/CustomCountdown";
import { getStoreSettings } from "@/lib/storeSettings";

export const Upcoming = async () => {
    const settings = await getStoreSettings();

    if (!settings.showUpcomingRelease) {
        return null;
    }

    const productName = [
        settings.releaseNameLine1,
        settings.releaseNameLine2,
        settings.releaseVersion,
    ]
        .filter(Boolean)
        .join(" ");

    const launchDate = settings.releaseCountdownEnds
        ? settings.releaseCountdownEnds.toISOString()
        : undefined;

    return (
        <section className="flex w-full items-center justify-center bg-second py-10">
            <div className="mx-auto grid h-full max-w-7xl grid-cols-1 gap-5 px-4 md:grid-cols-2">
                <div className="flex flex-col items-start justify-center space-y-3">
                    <div className="flex w-36 items-center justify-between bg-black px-2 text-xs text-white">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                        <h2>UPCOMING RELEASE</h2>
                    </div>

                    <h2 className="font-inter! text-5xl font-bold md:text-7xl">
                        {productName.split(" ").map((word, index, words) => (
                            <span
                                key={`${word}-${index}`}
                                className={`block ${
                                    index === words.length - 1
                                        ? "italic stroke-second"
                                        : "text-zinc-900"
                                }`}
                            >
                                {word.toUpperCase()}
                            </span>
                        ))}
                    </h2>

                    <p className="w-10/12 font-bold text-zinc-900">
                        {settings.releaseDescription}
                    </p>

                    <button
                        type="button"
                        className="border-2 border-black bg-black px-8 py-4 font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:bg-white hover:text-black hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none"
                    >
                        {settings.releaseButtonLabel}
                    </button>
                </div>

                <div className="flex items-center justify-center">
                    {launchDate && <LaunchCountdown targetDate={launchDate} />}
                </div>
            </div>
        </section>
    );
};
