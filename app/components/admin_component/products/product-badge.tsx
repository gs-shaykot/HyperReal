type ProductBadgeProps = {
    totalSold: number;
    createdAt: Date | string;
    isAvailable: boolean;
};

export const ProductBadge = ({
    totalSold,
    createdAt,
    isAvailable,
}: ProductBadgeProps) => {
    if (!isAvailable) {
        return (
            <span className="inline-flex bg-red-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-red-400">
                OUT OF STOCK
            </span>
        );
    }

    const daysSinceCreated =
        (Date.now() - new Date(createdAt).getTime()) /
        (1000 * 60 * 60 * 24);

    if (totalSold >= 10) {
        return (
            <span className="inline-flex bg-white/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                BESTSELLER
            </span>
        );
    }

    if (daysSinceCreated <= 14) {
        return (
            <span className="inline-flex bg-white/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                NEW
            </span>
        );
    }

    return (
        <span className="text-zinc-600">
            —
        </span>
    );
};