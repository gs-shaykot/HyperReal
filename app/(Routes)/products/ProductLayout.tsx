'use client'
import { Category } from '@/app/(Routes)/products/Category';
import { ProductCard } from '@/app/(Routes)/products/ProductCard';
import { ProductLayoutProps } from '@/app/types/Category';
import { ArrowDownUp } from 'lucide-react';
import { useState } from 'react';

export const ProductLayout = ({ categories, categoryId, products }: ProductLayoutProps) => {
    const [search, setSearch] = useState('');
    const [minPrice, setMinPrice] = useState('25');
    const [maxPrice, setMaxPrice] = useState('285');
    const [inStockOnly, setInStockOnly] = useState(false);
    const [sort, setSort] = useState('newest');

    const filteredProducts = [...(products ?? [])]
        .filter((product) => product.name.toLowerCase().includes(search.toLowerCase()))
        .filter((product) => !minPrice || product.price >= Number(minPrice))
        .filter((product) => !maxPrice || product.price <= Number(maxPrice))
        .filter((product) => !inStockOnly || product.isAvailable)
        .sort((first, second) => {
            if (sort === 'price-low') return first.price - second.price;
            if (sort === 'price-high') return second.price - first.price;
            if (sort === 'most-liked') return second.name.localeCompare(first.name);
            return 0;
        });

    return (
        <main className={`light:bg-white/90 bg-main/80`}>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5'>
                <div className=" -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-5  mb-10">
                    <h1 className={`light:text-zinc-900 text-white text-4xl font-bold uppercase tracking-wide`}>
                        All <span className="text-second">Products</span>
                    </h1>
                    <p className="mt-2 light:text-zinc-700 text-gray-200">
                        Archive of all available gear. Filter by category or search by collection.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
                    <aside className="lg:sticky lg:top-19.5 lg:self-start ">
                        <Category categories={categories} categoryId={categoryId} search={search} onSearchChange={setSearch} minPrice={minPrice} maxPrice={maxPrice} onMinPriceChange={setMinPrice} onMaxPriceChange={setMaxPrice} inStockOnly={inStockOnly} onInStockChange={setInStockOnly} />
                    </aside>

                    <section>
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                            <span className="font-mono text-[10px] uppercase text-zinc-400">{filteredProducts.length} / {products?.length ?? 0} units</span>
                            <div className="flex flex-wrap items-center justify-end gap-2">
                                <ArrowDownUp size={14} className="text-second" />
                                {[
                                    ['newest', 'Newest'],
                                    ['price-low', 'Price: Low - High'],
                                    ['price-high', 'Price: High - Low'],
                                    ['most-sold', 'Most Sold'],
                                    ['most-liked', 'Most Liked'],
                                ].map(([value, label]) => (
                                    <button key={value} type="button" onClick={() => setSort(value)} className={`border px-2 py-1.5 text-[9px] font-bold uppercase transition-colors ${sort === value ? 'border-second bg-second text-black' : 'border-zinc-800 text-zinc-400 hover:border-second hover:text-second'}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="min-h-100">
                            <ProductCard products={filteredProducts} />
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
};