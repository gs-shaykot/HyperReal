"use client";

import {
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation";

type ProductsPaginationProps = {
    page: number;
    totalPages: number;
};

export const ProductsPagination = ({
    page,
    totalPages,
}: ProductsPaginationProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const updatePage = (
        nextPage: number
    ) => {
        if (
            nextPage < 1 ||
            nextPage > totalPages ||
            nextPage === page
        ) {
            return;
        }

        const params = new URLSearchParams(
            searchParams.toString()
        );

        if (nextPage === 1) {
            params.delete("page");
        } else {
            params.set(
                "page",
                String(nextPage)
            );
        }

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
        <div className="flex items-center justify-between py-4">
            <p className="font-mono text-[10px] text-zinc-500">
                Page {page} of {totalPages}
            </p>

            <div className="flex items-center gap-1">
                <button
                    type="button"
                    disabled={page === 1}
                    onClick={() =>
                        updatePage(page - 1)
                    }
                    className="
                        border
                        border-zinc-800
                        px-3
                        py-2
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-zinc-500
                        disabled:cursor-not-allowed
                        disabled:opacity-30
                        hover:border-zinc-600
                        light:border-zinc-300
                    "
                >
                    Prev
                </button>

                <button
                    type="button"
                    disabled={
                        page === totalPages
                    }
                    onClick={() =>
                        updatePage(page + 1)
                    }
                    className="
                        border
                        border-zinc-800
                        px-3
                        py-2
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-white
                        disabled:cursor-not-allowed
                        disabled:opacity-30
                        hover:border-second
                        light:border-zinc-300
                        light:text-zinc-900
                    "
                >
                    Next
                </button>
            </div>
        </div>
    );
};