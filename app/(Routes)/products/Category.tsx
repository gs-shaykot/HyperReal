import { ProductLayoutProps } from '@/app/types/Category';
import { ChevronDown, Funnel, Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation';

type CategoryProps = ProductLayoutProps & {
    search: string;
    onSearchChange: (value: string) => void;
    minPrice: string;
    maxPrice: string;
    onMinPriceChange: (value: string) => void;
    onMaxPriceChange: (value: string) => void;
    inStockOnly: boolean;
    onInStockChange: (value: boolean) => void;
};

export const Category = ({
    categories,
    categoryId,
    search,
    onSearchChange,
    minPrice,
    maxPrice,
    onMinPriceChange,
    onMaxPriceChange,
    inStockOnly,
    onInStockChange,
}: CategoryProps) => {

    const router = useRouter();
    const searchParams = useSearchParams();

    const setCategory = (categoryId: string | number | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (categoryId === null) {
            params.delete('category');
        }
        else {
            params.set('category', String(categoryId));
        }
        router.push(`/products?${params.toString()}`);
    };

    const activeCategoryClass = (isActive: boolean) => ` 
        cursor-pointer 
        transition-all duration-300 ease-out 
        ${isActive ? ` 
            lg:before:w-2 lg:before:h-2 lg:before:bg-second
            lg:before:rounded-full lg:before:inline-block lg:before:mr-2
            lg:translate-x-2
            bg-second lg:bg-transparent ` : ''}`;


    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Funnel size={14} className="text-second" />
                <h2 className="text-xs font-bold uppercase text-second">Filters</h2>
            </div>

            <div className="border-b border-zinc-800 pb-3">
                <h2 className="cursor-pointer text-[11px] font-bold uppercase text-second">
                    Search 
                </h2>
                <label className="mt-3 flex items-center gap-2 border border-zinc-800 px-2 py-2 text-zinc-400 focus-within:border-second">
                    <Search size={14} />
                    <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="SEARCH GEAR..." aria-label="Search products" className="min-w-0 w-full bg-transparent text-[10px] uppercase outline-none placeholder:text-zinc-600" />
                </label>
            </div>


            <details open className="group border-b border-zinc-800 pb-3">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[11px] font-bold uppercase text-second">
                    Category
                    <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
                </summary>
                <ul className="mt-3 space-y-2">
                    <li onClick={() => setCategory(null)} className={`${activeCategoryClass(categoryId === null)} cursor-pointer text-xs text-zinc-300 hover:text-second`}>All</li>
                    {categories.map((category) => {
                        const isActive = categoryId === category.id;
                        return (
                            <li key={category.id}>
                                <button type="button" onClick={() => setCategory(category.id ?? null)} className={`${activeCategoryClass(isActive)} cursor-pointer text-xs text-zinc-300 hover:text-second`}>
                                    {category.name}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </details>

            <details open className="group border-b border-zinc-800 pb-3">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[11px] font-bold uppercase text-second">
                    Price Range
                    <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-3 flex items-center gap-2">
                    <label className="flex flex-1 items-center gap-1 border border-zinc-800 px-2 py-2 text-[10px] text-zinc-500">
                        $<input value={minPrice} onChange={(event) => onMinPriceChange(event.target.value)} aria-label="Minimum price" inputMode="decimal" className="min-w-0 w-full bg-transparent text-zinc-300 outline-none" />
                    </label>
                    <span className="text-zinc-600">-</span>
                    <label className="flex flex-1 items-center gap-1 border border-zinc-800 px-2 py-2 text-[10px] text-zinc-500">
                        $<input value={maxPrice} onChange={(event) => onMaxPriceChange(event.target.value)} aria-label="Maximum price" inputMode="decimal" className="min-w-0 w-full bg-transparent text-zinc-300 outline-none" />
                    </label>
                </div>
            </details>

            <details open className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[11px] font-bold uppercase text-second">
                    Availability
                    <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
                </summary>
                <label className="mt-3 flex cursor-pointer items-center gap-2 border border-zinc-800 px-2 py-2 text-[10px] uppercase text-zinc-400">
                    <input type="checkbox" checked={inStockOnly} onChange={(event) => onInStockChange(event.target.checked)} className="accent-second" />
                    In stock only
                </label>
            </details>
        </div>
    )
}