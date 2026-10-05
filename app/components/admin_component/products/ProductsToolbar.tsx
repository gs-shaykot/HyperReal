"use client";

import { ChevronDown, Funnel, Search } from "lucide-react";

export type Category = {
    id: string;
    name: string;
};

type ProductsToolbarProps = {
    searchProduct: string;
    category: string;
    categories: Category[];
    onSearchChangeAction: (value: string) => void;
    onCategoryChangeAction: (value: string) => void;
};

export const ProductsToolbar = ({
    searchProduct,
    category,
    categories,
    onSearchChangeAction,
    onCategoryChangeAction,
}: ProductsToolbarProps) => {
    return (
        <div className="my-6 flex gap-3">
            <div className="relative min-w-0 flex-1">
                <Search
                    className="
                        absolute
                        left-3
                        top-1/2
                        size-3.5
                        -translate-y-1/2
                        text-zinc-500
                    "
                />

                <input
                    value={searchProduct}
                    onChange={(event) =>
                        onSearchChangeAction(
                            event.target.value
                        )
                    }
                    placeholder="Search products..."
                    className="
                        h-10
                        w-full
                        border
                        border-zinc-800
                        bg-dark
                        pl-9
                        pr-3
                        font-mono
                        text-xs
                        text-white
                        outline-none
                        placeholder:text-zinc-500
                        focus:border-zinc-600
                        light:border-zinc-300
                        light:bg-white
                        light:text-zinc-900
                    "
                />
            </div>

            <div className="relative w-34 shrink-0">
                <Funnel
                    className="
                        absolute
                        left-3
                        top-1/2
                        z-10
                        size-3.5
                        -translate-y-1/2
                        text-zinc-500
                    "
                />
                <select
                    value={category}
                    onChange={(event) =>
                        onCategoryChangeAction(
                            event.target.value
                        )
                    }
                    className="
                        h-10
                        w-full
                        cursor-pointer
                        appearance-none
                        border
                        border-zinc-800
                        bg-dark
                        pl-9
                        pr-8
                        font-mono
                        text-xs
                        text-white
                        outline-none
                        light:border-zinc-300
                        light:bg-white
                        light:text-zinc-900
                    "
                >
                    <option value="">
                        All
                    </option>

                    {categories.map(
                        (category) => (
                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </option>
                        )
                    )}
                </select>
                <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                />
            </div>
        </div>
    );
};