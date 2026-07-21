import { MapPin, Plus, Star, Trash2 } from "lucide-react";

export const AddressSkeleton = () => {
    return (

        <section className="text-zinc-100">

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="skeleton h-8 w-60 rounded-none bg-zinc-800" />

                <button
                    className="btn btn-md rounded-none bg-zinc-800 border-zinc-700 shadow-none pointer-events-none"
                >
                    <Plus size={16} className="text-zinc-500" />
                    <div className="skeleton h-4 w-28 rounded-none bg-zinc-700" />
                </button>
            </div>

            {/* Address Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="relative flex flex-col h-full border border-zinc-700"
                    >
                        {/* Card Body */}
                        <div className="p-3 flex gap-3">

                            {/* Location Icon */}
                            <div className="mt-1">
                                <MapPin
                                    size={20}
                                    className="text-zinc-700"
                                />
                            </div>

                            {/* Content */}
                            <div className="flex-1 space-y-3">

                                {/* Label */}
                                <div className="skeleton h-4 w-20 rounded-none bg-zinc-700" />

                                {/* Name */}
                                <div className="skeleton h-5 w-40 rounded-none bg-zinc-800" />

                                {/* Address */}
                                <div className="space-y-2 pb-2 border-b border-dashed border-zinc-700">
                                    <div className="skeleton h-4 w-full rounded-none bg-zinc-800" />
                                    <div className="skeleton h-4 w-4/5 rounded-none bg-zinc-800" />
                                </div>

                                {/* City + Phone */}
                                <div className="flex justify-between items-center">
                                    <div className="skeleton h-4 w-28 rounded-none bg-zinc-800" />
                                    <div className="skeleton h-4 w-24 rounded-none bg-zinc-800" />
                                </div>

                                {/* Country */}
                                <div className="skeleton h-4 w-24 rounded-none bg-zinc-800" />

                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-auto p-3 border-t border-dashed border-zinc-700 flex justify-between gap-2">

                            <button
                                className="btn flex-1 rounded-none border-0 bg-transparent pointer-events-none"
                            >
                                <Star
                                    size={16}
                                    className="text-zinc-600"
                                />
                                <div className="skeleton h-4 w-16 rounded-none bg-zinc-700" />
                            </button>

                            <button
                                className="btn flex-1 rounded-none border-0 bg-transparent pointer-events-none"
                            >
                                <Trash2
                                    size={16}
                                    className="text-zinc-600"
                                />
                                <div className="skeleton h-4 w-16 rounded-none bg-zinc-700" />
                            </button>

                        </div>

                        {/* Fake Primary Badge */}
                        {index === 0 && (
                            <div className="absolute top-0 right-0">
                                <div className="skeleton h-7 w-20 rounded-none bg-zinc-700" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

        </section>
    )
}
