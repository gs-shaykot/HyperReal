import { Category } from '@/app/(Routes)/products/Category';
import { ProductCard } from '@/app/(Routes)/products/ProductCard';
import { ProductLayoutProps } from '@/app/types/Category';
import { ArrowDownUp } from 'lucide-react';

export const ProductLayout = ({ categories, products }: ProductLayoutProps) => {
    return (
        <main className={`light:bg-white/90 bg-main/80`}>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5'>
                <div className=" -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-5  mb-10">
                    <h1 className={`light:text-zinc-900 text-white text-4xl font-bold uppercase tracking-wide`}>
                        All <span className="text-second">Products</span>
                    </h1>
                    <p className="mt-2 light:text-zinc-700 text-gray-200">
                        Archive of all available gear. Browse the full collection.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
                    <aside className="lg:sticky lg:top-19.5 lg:self-start ">
                        <Category categories={categories} />
                    </aside>

                    <section>
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                            <span className="font-mono text-[10px] uppercase text-zinc-400">{products?.length ?? 0} units</span>
                            <div className="flex flex-wrap items-center justify-end gap-2" aria-label="Sort products">
                                <ArrowDownUp size={14} className="text-second" aria-hidden="true" />
                                <button type="button" className="border border-second bg-second px-3 py-2 text-[10px] font-bold uppercase text-black">
                                    Newest
                                </button>
                                <button type="button" className="border border-zinc-800 px-3 py-2 text-[10px] font-bold uppercase text-zinc-400 transition-colors hover:border-second hover:text-second">
                                    Price: Low - High
                                </button>
                                <button type="button" className="border border-zinc-800 px-3 py-2 text-[10px] font-bold uppercase text-zinc-400 transition-colors hover:border-second hover:text-second">
                                    Price: High - Low
                                </button>
                                <button type="button" className="border border-zinc-800 px-3 py-2 text-[10px] font-bold uppercase text-zinc-400 transition-colors hover:border-second hover:text-second">
                                    Most Sold
                                </button>
                                <button type="button" className="border border-zinc-800 px-3 py-2 text-[10px] font-bold uppercase text-zinc-400 transition-colors hover:border-second hover:text-second">
                                    Most Liked
                                </button>
                            </div>
                        </div>
                        <div className="min-h-100">
                            <ProductCard products={products} />
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
};