import { Eye } from "lucide-react";

export default function Loading() {
    return (
        <section className="text-zinc-100">

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="skeleton h-8 w-56 rounded-none bg-zinc-800" />
                <div className="skeleton h-4 w-28 rounded-none bg-zinc-800" />
            </div>

            {/* Order Cards */}
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex justify-between items-center border border-zinc-700 p-4"
                    >
                        {/* Left */}
                        <div className="flex flex-col space-y-4 flex-1">

                            {/* Order Code + Status */}
                            <div className="flex items-center gap-3">
                                <div className="skeleton h-5 w-44 rounded-none bg-zinc-800" />
                                <div className="skeleton h-6 w-28 rounded-full bg-zinc-800" />
                            </div>

                            {/* Date + Items */}
                            <div className="flex items-center gap-4">
                                <div className="skeleton h-4 w-28 rounded-none bg-zinc-800" />
                                <div className="w-2 h-2 rounded-full border border-zinc-700" />
                                <div className="skeleton h-4 w-16 rounded-none bg-zinc-800" />
                            </div>

                            {/* Product Chips */}
                            <div className="flex flex-wrap gap-2">
                                <div className="skeleton h-7 w-28 rounded-none bg-zinc-900" />
                                <div className="skeleton h-7 w-24 rounded-none bg-zinc-900" />
                                <div className="skeleton h-7 w-32 rounded-none bg-zinc-900" />
                            </div>

                        </div>

                        {/* Right */}
                        <div className="flex items-center gap-5 ml-8">

                            <div className="flex flex-col items-center gap-2">
                                <div className="skeleton h-3 w-12 rounded-none bg-zinc-800" />
                                <div className="skeleton h-5 w-20 rounded-none bg-zinc-700" />
                            </div>

                            <div className="btn btn-sm rounded-none border border-zinc-700 bg-transparent pointer-events-none">
                                <Eye
                                    size={16}
                                    className="text-zinc-600"
                                />
                                <div className="skeleton h-4 w-10 rounded-none bg-zinc-700" />
                            </div>

                        </div>
                    </div>
                ))}
            </div>

        </section>
    );
}