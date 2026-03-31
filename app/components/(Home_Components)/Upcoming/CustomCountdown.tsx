"use client"; 
import Countdown from "react-countdown";

// here i want to persist the countdown. the countdown should not reset if the user leaves the page and comes back. it should continue counting down from where it left off. The admin will set a target date for the countdown.
export default function LaunchCountdown() {
 
    const targetDate = Date.now() + 1000 * 60 * 60 * 24 * 5;
 
    const renderer = ({ days, hours, minutes, seconds }: { days: number; hours: number; minutes: number; seconds: number }) => {
        return (
            <div className="flex gap-6">

                {/* DAYS */}
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-black flex items-center justify-center text-lime-400 text-4xl font-bold">
                        {String(days).padStart(2, "0")}
                    </div>
                    <p className="mt-2 text-xs font-semibold tracking-widest">DAYS</p>
                </div>

                {/* HOURS */}
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-black flex items-center justify-center text-lime-400 text-4xl font-bold">
                        {String(hours).padStart(2, "0")}
                    </div>
                    <p className="mt-2 text-xs font-semibold tracking-widest">HOURS</p>
                </div>

                {/* MINUTES */}
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-black flex items-center justify-center text-lime-400 text-4xl font-bold">
                        {String(minutes).padStart(2, "0")}
                    </div>
                    <p className="mt-2 text-xs font-semibold tracking-widest">MINS</p>
                </div>

                {/* SECONDS */}
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-black flex items-center justify-center text-lime-400 text-4xl font-bold">
                        {String(seconds).padStart(2, "0")}
                    </div>
                    <p className="mt-2 text-xs font-semibold tracking-widest">SECS</p>
                </div>

            </div>
        );
    };

    return (
        <Countdown date={targetDate} renderer={renderer} />
    );
}