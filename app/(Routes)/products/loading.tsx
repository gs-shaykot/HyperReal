export default function Loading() {
    return (
        <main className="light:bg-white bg-main/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                {/* Skeleton Header */}
                <div className="mb-10">
                    <div className="h-10 w-64 light:bg-zinc-200 bg-zinc-700 animate-pulse rounded mb-3" />
                    <div className="h-4 w-96 light:bg-zinc-300 bg-zinc-800 animate-pulse rounded" />
                </div>
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
                    {/* Skeleton Sidebar */}
                    <aside>
                        <div className="border-b light:border-zinc-300 border-zinc-800 mb-4 pb-4">
                            <div className="h-5 w-28 light:bg-zinc-200 bg-zinc-700 animate-pulse rounded" />
                        </div>
                        <div className="flex flex-col gap-3 mt-4">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-4 light:bg-zinc-300 bg-zinc-800 animate-pulse rounded"
                                    style={{ width: `${60 + Math.random() * 30}%` }}
                                />
                            ))}
                        </div>
                    </aside>
                    {/* Skeleton Product Cards */}
                    <section>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="border-2 light:border-zinc-300 border-zinc-800 overflow-hidden">
                                    <div className="h-80 w-full light:bg-zinc-200 bg-zinc-800 animate-pulse" />
                                    <div className="px-3 py-2 flex justify-between items-center">
                                        <div className="h-4 w-24 light:bg-zinc-300 bg-zinc-700 animate-pulse rounded" />
                                        <div className="h-4 w-12 light:bg-zinc-300 bg-zinc-700 animate-pulse rounded" />
                                    </div>
                                    <div className="px-3 pb-2">
                                        <div className="h-3 w-16 light:bg-zinc-200 bg-zinc-800 animate-pulse rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}