
"use client";

import { OrderStatus } from "@prisma/client";
import { Search } from "lucide-react";

type OrdersToolbarProps = {
    searchOrder: string;
    selectedStatus: string;
    onSearchChangeAction: (value: string) => void;
    onStatusChangeAction: (value: string) => void;
};

export const OrdersToolbar = ({
    searchOrder,
    selectedStatus,
    onSearchChangeAction,
    onStatusChangeAction,
}: OrdersToolbarProps) => {
    const orderStatuses = Object.values(OrderStatus);

    const tabs = [
        { label: "ALL", value: "" },
        ...orderStatuses.map((value) => ({
            label: value,
            value,
        })),
    ];

    return (
        <div className="my-6 flex flex-col gap-3 xl:flex-row">
            <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />

                <input
                    value={searchOrder}
                    onChange={(event) =>
                        onSearchChangeAction(event.target.value)
                    }
                    placeholder="Search by order ID, customer name or email..."
                    className="h-10 w-full border border-zinc-800 bg-dark pl-9 pr-3 font-mono text-xs text-white outline-none placeholder:text-zinc-500 focus:border-second light:border-zinc-300 light:bg-white light:text-zinc-900"
                />
            </div>

            <div className="flex flex-wrap gap-1">
                {tabs.map((tab) => {
                    const active = selectedStatus === tab.value;

                    return (
                        <button
                            key={tab.value || "all"}
                            type="button"
                            onClick={() => onStatusChangeAction(
                                tab.value || "all"
                            )}
                            aria-pressed={active}
                            className={`h-10 border px-3 font-mono text-[9px] font-bold uppercase tracking-wider transition-colors ${
                                active
                                    ? "border-second bg-second text-black"
                                    : "border-zinc-800 bg-dark text-zinc-400 hover:border-zinc-600 hover:text-white light:border-zinc-300 light:bg-white light:text-zinc-600"
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
