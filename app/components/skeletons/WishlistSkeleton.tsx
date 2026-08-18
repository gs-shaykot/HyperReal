import { Eye, Heart, Trash2 } from "lucide-react";

export const WishlistSkeleton = () => {
    return (

        <section className="text-zinc-100 light:text-zinc-900">

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="skeleton h-8 w-52 rounded-none bg-zinc-800 light:bg-zinc-300" />

                <div className="flex items-center gap-3">
                    <div className="skeleton h-4 w-16 rounded-none bg-zinc-800 light:bg-zinc-300" />

                    <button
                        className="btn btn-sm rounded-none bg-transparent border border-zinc-700 light:border-zinc-300 pointer-events-none shadow-none"
                    >
                        <Trash2
                            size={16}
                            className="text-zinc-600 light:text-zinc-500"
                        />
                        <div className="skeleton h-4 w-20 rounded-none bg-zinc-700 light:bg-zinc-300" />
                    </button>
                </div>
            </div>

            {/* Wishlist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {Array.from({ length: 6 }).map((_, index) => (
                    <div
                        key={index}
                        className="card rounded-none border border-zinc-700 light:border-zinc-300 bg-base-100 light:bg-white shadow-sm overflow-hidden"
                    >

                        {/* Product Image */}
                        <div className="skeleton w-full aspect-square rounded-none bg-zinc-800 light:bg-zinc-200" />

                        {/* Card Body */}
                        <div className="card-body p-3.5 bg-[#1a1a1a] light:bg-zinc-50 space-y-3">

                            {/* Category */}
                            <div className="skeleton h-4 w-24 rounded-none bg-zinc-700 light:bg-zinc-300" />

                            {/* Product Name + Size */}
                            <div className="flex justify-between items-start gap-3">

                                <div className="flex-1 space-y-2">
                                    <div className="skeleton h-5 w-full rounded-none bg-zinc-800 light:bg-zinc-200" />
                                    <div className="skeleton h-5 w-3/4 rounded-none bg-zinc-800 light:bg-zinc-200" />
                                </div>

                                <div className="skeleton h-5 w-14 rounded-none bg-zinc-700 light:bg-zinc-300 shrink-0" />

                            </div>

                            {/* Price */}
                            <div className="skeleton h-6 w-20 rounded-none bg-zinc-700 light:bg-zinc-300" />

                            {/* Buttons */}
                            <div className="flex justify-between items-center gap-2 pt-1">

                                {/* Add to Cart */}
                                <div className="skeleton h-10 flex-1 rounded-none bg-zinc-700 light:bg-zinc-300" />

                                {/* View */}
                                <button
                                    className="btn rounded-none bg-transparent border border-zinc-700 light:border-zinc-300 pointer-events-none"
                                >
                                    <Eye
                                        size={18}
                                        className="text-zinc-600 light:text-zinc-500"
                                    />
                                </button>

                                {/* Wishlist */}
                                <button
                                    className="btn rounded-none bg-transparent border border-zinc-700 light:border-zinc-300 pointer-events-none"
                                >
                                    <Heart
                                        size={18}
                                        className="text-zinc-600 light:text-zinc-500"
                                    />
                                </button>

                            </div>

                        </div>

                    </div>
                ))}

            </div>

        </section>
    )
}
