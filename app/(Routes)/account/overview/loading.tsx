import { Package, CircleCheckBig, Heart } from "lucide-react";

export default function Loading() {
    return (
        <div className="space-y-6 animate-pulse light:text-zinc-900 text-zinc-100">

            {/* Stats */}
            <div className="grid grid-cols-3 gap-5">
                {[Package, CircleCheckBig, Heart].map((Icon, index) => (
                    <div
                        key={index}
                        className="border border-neutral-700 light:border-zinc-300 bg-[#0f0f0f] light:bg-[#f5f6f8] p-5"
                    >
                        <div className="flex justify-between items-start">
                            <div className="space-y-3">
                                <div className="h-3 w-20 bg-zinc-800 light:bg-zinc-300 rounded" />
                                <div className="h-8 w-12 bg-zinc-700 light:bg-zinc-400 rounded" />
                            </div>

                            <div className="w-10 h-10 rounded-full bg-zinc-800 light:bg-zinc-300 flex items-center justify-center">
                                <Icon
                                    size={18}
                                    className="text-zinc-600 light:text-zinc-500"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Identity */}
            <div className="border border-neutral-700 light:border-zinc-300 bg-[#0f0f0f] light:bg-[#f5f6f8] p-5">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-6 w-44 bg-zinc-800 light:bg-zinc-300 rounded" />
                    <div className="h-9 w-20 bg-zinc-800 light:bg-zinc-300 rounded" />
                </div>

                <div className="grid grid-cols-2 gap-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="space-y-3"
                        >
                            <div className="h-3 w-20 bg-zinc-800 light:bg-zinc-300 rounded" />
                            <div className="h-5 w-40 bg-zinc-700 light:bg-zinc-400 rounded" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Orders */}
            <div className="border border-neutral-700 light:border-zinc-300 bg-[#0f0f0f] light:bg-[#f5f6f8] p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-6 w-44 bg-zinc-800 light:bg-zinc-300 rounded" />
                    <div className="h-4 w-16 bg-zinc-800 light:bg-zinc-300 rounded" />
                </div>

                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div
                            key={index}
                            className="flex justify-between items-center border border-zinc-800 light:border-zinc-300 p-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-zinc-800 light:bg-zinc-300" />

                                <div className="space-y-2">
                                    <div className="h-4 w-32 bg-zinc-700 light:bg-zinc-400 rounded" />
                                    <div className="h-3 w-24 bg-zinc-800 light:bg-zinc-300 rounded" />
                                </div>
                            </div>

                            <div className="h-5 w-20 bg-zinc-700 light:bg-zinc-400 rounded" />
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}