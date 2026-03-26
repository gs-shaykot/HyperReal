import React from 'react'

const loading = () => {
    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5'>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                {/* IMAGE */}
                <div className="aspect-square bg-zinc-800 border border-zinc-700 animate-pulse" />

                {/* DETAILS */}
                <div>

                    {/* CATEGORY */}
                    <div className="h-4 w-40 bg-zinc-700 mb-3 rounded animate-pulse" />

                    {/* NAME */}
                    <div className="h-8 w-3/4 bg-zinc-700 mb-4 rounded animate-pulse" />

                    {/* PRICE */}
                    <div className="h-6 w-24 bg-zinc-700 mb-3 rounded animate-pulse" />

                    {/* DESCRIPTION */}
                    <div className="space-y-2 mb-6">
                        <div className="h-3 w-full bg-zinc-800 rounded animate-pulse" />
                        <div className="h-3 w-5/6 bg-zinc-800 rounded animate-pulse" />
                        <div className="h-3 w-4/6 bg-zinc-800 rounded animate-pulse" />
                    </div>

                    {/* COLORS */}
                    <div className="mb-6">
                        <div className="h-4 w-32 bg-zinc-700 mb-3 rounded animate-pulse" />
                        <div className="flex gap-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-zinc-700 animate-pulse" />
                            ))}
                        </div>
                    </div>

                    {/* SIZES */}
                    <div className="mb-6">
                        <div className="h-4 w-28 bg-zinc-700 mb-3 rounded animate-pulse" />
                        <div className="flex gap-2">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-8 w-14 bg-zinc-700 rounded animate-pulse" />
                            ))}
                        </div>
                    </div>

                    {/* BUTTON + QUANTITY */}
                    <div className="flex gap-3 items-center mt-4">
                        <div className="h-10 w-28 bg-zinc-700 rounded animate-pulse" />
                        <div className="h-10 flex-1 bg-zinc-700 rounded animate-pulse" />
                    </div>

                    {/* TABS */}
                    <div className="mt-8 space-y-3">
                        <div className="flex gap-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-4 w-20 bg-zinc-700 rounded animate-pulse" />
                            ))}
                        </div>

                        <div className="space-y-2 mt-4">
                            <div className="h-3 w-full bg-zinc-800 rounded animate-pulse" />
                            <div className="h-3 w-5/6 bg-zinc-800 rounded animate-pulse" />
                            <div className="h-3 w-4/6 bg-zinc-800 rounded animate-pulse" />
                        </div>
                    </div>

                </div>
            </div>
        </div>

    )
}

export default loading;