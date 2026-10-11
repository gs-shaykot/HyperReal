
"use client";

type UsersPaginationProps = {
    page: number;
    totalPages: number;
    onPageChangeAction: (page: number) => void;
};

export const UsersPagination = ({
    page,
    totalPages,
    onPageChangeAction,
}: UsersPaginationProps) => (
    <div className="flex items-center justify-between py-4">
        <p className="font-mono text-[10px] text-zinc-500">
            Page {page} of {totalPages}
        </p>

        <div className="flex items-center gap-1">
            <button
                type="button"
                disabled={page <= 1}
                onClick={() => onPageChangeAction(page - 1)}
                className="border border-zinc-800 px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-500 hover:border-zinc-600 disabled:cursor-not-allowed disabled:opacity-30 light:border-zinc-300"
            >
                Prev
            </button>

            <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => onPageChangeAction(page + 1)}
                className="border border-zinc-800 px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-wider text-white hover:border-second disabled:cursor-not-allowed disabled:opacity-30 light:border-zinc-300 light:text-zinc-900"
            >
                Next
            </button>
        </div>
    </div>
);
