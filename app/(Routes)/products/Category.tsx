'use client';
import { ProductLayoutProps } from '@/app/types/Category';
import { ChevronDown, Funnel, Search, Trash } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type CategoryProps = ProductLayoutProps & {
    categoryId?: string | null;
};

export const Category = ({ categories, categoryId }: CategoryProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const updateFilter = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        router.push(`/products?${params.toString()}`);
    };

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        ['search', 'minPrice', 'maxPrice', 'inStock', 'category'].forEach((key) => {
            params.delete(key);
        });

        const nextQuery = params.toString();
        router.replace(nextQuery ? `/products?${nextQuery}` : '/products');
    };

    const search = searchParams.get('search') ?? '';
    const minPrice = searchParams.get('minPrice') ?? '';
    const maxPrice = searchParams.get('maxPrice') ?? '';
    const inStock = searchParams.get('inStock') === 'true';

    const isFirstRender = useRef(true);
    const userChangedFilters = useRef(false);

    const [inputState, setInputState] = useState<{
        searchInput: string;
        minPriceInput: string;
        maxPriceInput: string;
    }>({
        searchInput: search,
        minPriceInput: minPrice,
        maxPriceInput: maxPrice,
    });

    useEffect(() => {
        setInputState({
            searchInput: search,
            minPriceInput: minPrice,
            maxPriceInput: maxPrice,
        });
    }, [search, minPrice, maxPrice]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (!userChangedFilters.current) return

        const timeout = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());

            const currentSearch = params.get('search') ?? '';
            const currentMinPrice = params.get('minPrice') ?? '';
            const currentMaxPrice = params.get('maxPrice') ?? '';

            if (inputState.searchInput !== currentSearch) {
                if (inputState.searchInput.trim()) {
                    params.set('search', inputState.searchInput.trim());
                }
                else {
                    params.delete('search');
                }
            }

            if (inputState.minPriceInput !== currentMinPrice) {
                if (inputState.minPriceInput.trim()) {
                    params.set('minPrice', inputState.minPriceInput.trim());
                } else {
                    params.delete('minPrice');
                }
            }

            if (inputState.maxPriceInput !== currentMaxPrice) {
                if (inputState.maxPriceInput.trim()) {
                    params.set('maxPrice', inputState.maxPriceInput.trim());
                } else {
                    params.delete('maxPrice');
                }
            }


            const nextQuery = params.toString();
            const currentQuery = searchParams.toString();

            if (nextQuery !== currentQuery) {
                router.replace(`/products?${nextQuery}`);
            }

            userChangedFilters.current = false;
        }, 400);
        return () => clearTimeout(timeout);
    }, [
        inputState.searchInput,
        inputState.minPriceInput,
        inputState.maxPriceInput,
        searchParams,
        router
    ]);

    const activeCategoryClass = (isActive: boolean) => `cursor-pointer transition-all duration-300 ease-out ${isActive ? 'lg:before:w-2 lg:before:h-2 lg:before:bg-second lg:before:rounded-full lg:before:inline-block lg:before:mr-2 lg:translate-x-2 bg-second lg:bg-transparent' : ''}`;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Funnel size={14} className="text-second" />
                <h2 className="text-xs font-bold uppercase text-second">Filters</h2>

                <button
                    type="button"
                    onClick={clearFilters}
                    aria-label="Clear all filters"
                    className="ml-auto cursor-pointer text-[10px] font-bold uppercase text-zinc-400 hover:text-second"
                >
                    <Trash size={18}/>  
                </button>
            </div>
            {/* Search Box */}
            <div className="border-b border-zinc-800 pb-3">
                <h2 className="cursor-pointer text-[11px] font-bold uppercase text-second">
                    Search
                </h2>
                <label className="mt-3 flex items-center gap-2 border border-zinc-800 px-2 py-2 text-zinc-400 focus-within:border-second">
                    <Search size={14} />
                    <input
                        value={inputState.searchInput}
                        onChange={(e) => {
                            userChangedFilters.current = true;
                            setInputState((prev) => ({ ...prev, searchInput: e.target.value }));
                        }}
                        placeholder="SEARCH GEAR..." aria-label="Search products"
                        className="min-w-0 w-full bg-transparent text-[10px] uppercase outline-none placeholder:text-zinc-600" />
                </label>
            </div>

            {/* Category Options */}
            <details open className="group border-b border-zinc-800 pb-3">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[11px] font-bold uppercase text-second">
                    Category
                    <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
                </summary>
                <ul className="mt-3 space-y-2">
                    <li>
                        <button onClick={() => updateFilter('category', null)} className={`${activeCategoryClass(categoryId === null)} text-xs text-zinc-300 hover:text-second`}>
                            All
                        </button>
                    </li>
                    {categories.map((category) => {
                        const isActive = categoryId === category.id;
                        return (
                            <li key={category.id}>
                                <button
                                    onClick={() => updateFilter('category', category.id)}
                                    className={`${activeCategoryClass(isActive)} text-xs text-zinc-300 hover:text-second`}>
                                    {category.name}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </details>

            {/* Price Range Options */}
            <details open className="group border-b border-zinc-800 pb-3">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[11px] font-bold uppercase text-second">
                    Price Range
                    <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-3 flex items-center gap-2">
                    <label className="flex flex-1 items-center gap-1 border border-zinc-800 px-2 py-2 text-[10px] text-zinc-500">
                        $<input
                            value={inputState.minPriceInput}
                            onChange={(e) => {
                                userChangedFilters.current = true;
                                setInputState((prev) => ({ ...prev, minPriceInput: e.target.value }));
                            }}
                            placeholder="25" aria-label="Minimum price" inputMode="decimal"
                            className="min-w-0 w-full bg-transparent text-zinc-300 outline-none" />
                    </label>
                    <span className="text-zinc-600">-</span>
                    <label className="flex flex-1 items-center gap-1 border border-zinc-800 px-2 py-2 text-[10px] text-zinc-500">
                        $<input
                            value={inputState.maxPriceInput}
                            onChange={(e) => {
                                userChangedFilters.current = true;
                                setInputState((prev) => ({ ...prev, maxPriceInput: e.target.value }));
                            }}
                            placeholder="285" aria-label="Maximum price" inputMode="decimal"
                            className="min-w-0 w-full bg-transparent text-zinc-300 outline-none" />
                    </label>
                </div>
            </details>

            {/* Availability Options */}
            <details open className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[11px] font-bold uppercase text-second">
                    Availability
                    <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
                </summary>
                <label className="mt-3 flex cursor-pointer items-center gap-2 border border-zinc-800 px-2 py-2 text-[10px] uppercase text-zinc-400">
                    <input type="checkbox" checked={inStock} onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : null)} className="accent-second" />
                    In stock only
                </label>
            </details>
        </div>
    )
}