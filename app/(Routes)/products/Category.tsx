import { ProductLayoutProps } from '@/app/types/Category';
import { ChevronDown, Funnel, Search } from 'lucide-react'
import Link from 'next/link';

type CategoryProps = ProductLayoutProps & {
    categoryId?: string | null;
};

export const Category = ({ categories, categoryId }: CategoryProps) => {
    const activeCategoryClass = (isActive: boolean) => `
        transition-all duration-300 ease-out ${isActive ? 'lg:before:w-2 lg:before:h-2 lg:before:bg-second lg:before:rounded-full lg:before:inline-block lg:before:mr-2 lg:translate-x-2 bg-second lg:bg-transparent' : ''}`;

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
                    <input defaultValue="" readOnly placeholder="SEARCH GEAR..." aria-label="Search products" className="min-w-0 w-full bg-transparent text-[10px] uppercase outline-none placeholder:text-zinc-600" />
                </label>
            </div>

            <details open className="group border-b border-zinc-800 pb-3">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[11px] font-bold uppercase text-second">
                    Category
                    <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
                </summary>
                <ul className="mt-3 space-y-2">
                    <li>
                        <Link href="/products" className={`${activeCategoryClass(categoryId === null)} text-xs text-zinc-300 hover:text-second`}>
                            All
                        </Link>
                    </li>
                    {categories.map((category) => {
                        const isActive = categoryId === category.id;
                        return (
                            <li key={category.id}>
                                <Link href={`/products?category=${category.id}`} className={`${activeCategoryClass(isActive)} text-xs text-zinc-300 hover:text-second`}>
                                    {category.name}
                                </Link>
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
                        $<input defaultValue="25" readOnly aria-label="Minimum price" inputMode="decimal" className="min-w-0 w-full bg-transparent text-zinc-300 outline-none" />
                    </label>
                    <span className="text-zinc-600">-</span>
                    <label className="flex flex-1 items-center gap-1 border border-zinc-800 px-2 py-2 text-[10px] text-zinc-500">
                        $<input defaultValue="285" readOnly aria-label="Maximum price" inputMode="decimal" className="min-w-0 w-full bg-transparent text-zinc-300 outline-none" />
                    </label>
                </div>
            </details>

            <details open className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[11px] font-bold uppercase text-second">
                    Availability
                    <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
                </summary>
                <label className="mt-3 flex cursor-pointer items-center gap-2 border border-zinc-800 px-2 py-2 text-[10px] uppercase text-zinc-400">
                    <input type="checkbox" disabled className="accent-second" />
                    In stock only
                </label>
            </details>
        </div>
    )
}