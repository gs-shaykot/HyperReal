'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Category } from '@/app/(Routes)/products/Category';
import { ProductCard } from '@/app/(Routes)/products/ProductCard';
import { ProductLayoutProps } from '@/app/types/Category';
import { ArrowDownUp } from 'lucide-react';

export const ProductLayout = ({ categories, categoryId, products }: ProductLayoutProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentSort = searchParams.get('sort') ?? 'newest';

    const updateSort = (sort: string) => {
        const params = new URLSearchParams(searchParams.toString());

        params.set('sort', sort);

        router.push(`/products?${params.toString()}`);
    };

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
                        <Category categories={categories} categoryId={categoryId} />
                    </aside>

                    <section>
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                            <span className="font-mono text-[10px] uppercase text-zinc-400">{products?.length ?? 0} units</span>
                            <div className="flex flex-wrap items-center justify-end gap-2" aria-label="Sort products">
                                <ArrowDownUp size={14} className="text-second" aria-hidden="true" />
                                <button
                                    onClick={() => updateSort('newest')} type="button"
                                    className={`${currentSort === 'newest' ? 'border border-second bg-second text-zinc-900' : 'border border-zinc-800'} cursor-pointer px-3 py-2 text-[10px] font-bold uppercase text-zinc-400`}>
                                    Newest
                                </button>
                                <button
                                    onClick={() => updateSort('price-low')} type="button"
                                    className={` ${currentSort === 'price-low' ? 'border border-second bg-second text-zinc-900' : 'border border-zinc-800'} cursor-pointer px-3 py-2 text-[10px] font-bold uppercase text-zinc-400 transition-colors hover:border-second`}>
                                    Price: Low - High
                                </button>
                                <button
                                    onClick={() => updateSort('price-high')} type="button"
                                    className={` ${currentSort === 'price-high' ? 'border border-second bg-second text-zinc-900' : 'border border-zinc-800'} cursor-pointer px-3 py-2 text-[10px] font-bold uppercase text-zinc-400 transition-colors hover:border-second`}>
                                    Price: High - Low
                                </button>
                                <button
                                    onClick={() => updateSort('most-sold')} type="button"
                                    className={`${currentSort === 'most-sold' ? 'border border-second bg-second text-zinc-900' : 'border border-zinc-800'} cursor-pointer px-3 py-2 text-[10px] font-bold uppercase text-zinc-400 transition-colors hover:border-second`}>
                                    Most Sold
                                </button>
                                <button
                                    onClick={() => updateSort('most-liked')} type="button"
                                    className={` ${currentSort === 'most-liked' ? 'border border-second bg-second text-zinc-900' : 'border border-zinc-800'} cursor-pointer px-3 py-2 text-[10px] font-bold uppercase text-zinc-400 transition-colors hover:border-second`}>
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