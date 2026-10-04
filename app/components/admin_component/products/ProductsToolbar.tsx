"use client";

import { Funnel, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

    const currentSearch = searchParams.get("search") ?? "";
    const currentCategory = searchParams.get("category") ?? "";

    const [search, setSearch] = useState(currentSearch);

    useEffect(() => {
        setSearch(currentSearch);
    }, [currentSearch]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const params = new URLSearchParams(
                searchParams.toString()
            );

            if (search.trim()) {
                params.set("search", search.trim());
            } else {
                params.delete("search");
            }

            params.delete("page");

            const query = params.toString();

            router.replace(
                query ? `${pathname}?${query}` : pathname
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [
        search,
        pathname,
        router,
        searchParams,
    ]);

    const updateCategory = (value: string) => {
        const params = new URLSearchParams(
            searchParams.toString()
        );

        if (value) {
            params.set("category", value);
        } else {
            params.delete("category");
        }

        params.delete("page");

        const query = params.toString();

        router.push(
            query ? `${pathname}?${query}` : pathname
        );
    };

    return (
        <div className="mt-6 flex gap-3">
            {/* Search */}
            <div className="relative min-w-0 flex-1">
                <Search
                    className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500"
                    aria-hidden="true"
                />

                <input
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                    placeholder="Search products..."
                    className="h-10 w-full border border-zinc-800 bg-dark pl-9 pr-3 font-mono text-xs text-white outline-none placeholder:text-zinc-500 focus:border-zinc-600 light:bg-white light:text-zinc-900 light:border-zinc-300"/>
            </div>

            {/* Category */}
            <div className="relative w-34 shrink-0">
                <Funnel
                    className="absolute left-3 top-1/2 z-10 size-3.5 -translate-y-1/2 text-zinc-500"
                    aria-hidden="true"
                />

                <select
                    value={currentCategory}
                    onChange={(event) =>
                        updateCategory(event.target.value)
                    }
                    className="h-10 w-full appearance-none border border-zinc-800 bg-dark pl-9 pr-8 font-mono text-xs text-white outline-none cursor-pointer light:bg-white light:text-zinc-900 light:border-zinc-300">
                    <option value="">All</option>

                    {categories.map((category) => (
                        <option
                            key={category.id}
                            value={category.id}
                        >
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};