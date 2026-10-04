"use client";

import { Funnel, Search } from "lucide-react";
import {
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation";
import { useEffect, useState } from "react";

type Category = {
    id: string;
    name: string;
};

type ProductsToolbarProps = {
    categories: Category[];
};

export const ProductsToolbar = ({
    categories,
}: ProductsToolbarProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentSearch =
        searchParams.get("search") ?? "";

    const currentCategory =
        searchParams.get("category") ?? "";

    const [search, setSearch] =
        useState(currentSearch);

    useEffect(() => {
        setSearch(currentSearch);
    }, [currentSearch]);

    /*
     * Update URL only after the user stops typing.
     *
     * IMPORTANT:
     * We do NOT put searchParams in the effect dependency
     * that performs router.replace().
     *
     * This prevents the navigation loop.
     */
    useEffect(() => {
        const normalizedSearch = search.trim();

        if (normalizedSearch === currentSearch) {
            return;
        }

        const timeout = setTimeout(() => {
            const params = new URLSearchParams(
                searchParams.toString()
            );

            if (normalizedSearch) {
                params.set(
                    "search",
                    normalizedSearch
                );
            } else {
                params.delete("search");
            }

            /*
             * A new search starts from page 1.
             */
            params.delete("page");

            const query = params.toString();

            router.replace(
                query
                    ? `${pathname}?${query}`
                    : pathname,
                {
                    scroll: false,
                }
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [
        search,
        currentSearch,
        pathname,
        router,
        searchParams,
    ]);

    const updateCategory = (
        value: string
    ) => {
        const params = new URLSearchParams(
            searchParams.toString()
        );

        if (value) {
            params.set("category", value);
        } else {
            params.delete("category");
        }

        /*
         * Changing the category starts from page 1.
         */
        params.delete("page");

        const query = params.toString();

        router.replace(
            query
                ? `${pathname}?${query}`
                : pathname,
            {
                scroll: false,
            }
        );
    };

    return (
        <div className="mt-6 flex gap-3">
            {/* Search */}
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
                    aria-hidden="true"
                />

                <input
                    value={search}
                    onChange={(event) =>
                        setSearch(
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

            {/* Category */}
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
                    aria-hidden="true"
                />

                <select
                    value={currentCategory}
                    onChange={(event) =>
                        updateCategory(
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
            </div>
        </div>
    );
};