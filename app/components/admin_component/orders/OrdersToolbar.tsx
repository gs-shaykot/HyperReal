import { OrderStatus } from '@prisma/client';
import { Search } from 'lucide-react'
import React from 'react'

type OrdersToolbarProps = {
    searchOrder: string;
    onSearchChangeAction: (value: string) => void;
    onStatusChangeAction: (value: string) => void;
}

export const OrdersToolbar = ({ searchOrder, onSearchChangeAction, onStatusChangeAction }: OrdersToolbarProps) => {
    const orderStatuses = Object.values(OrderStatus);
    console.log("Order Statuses: ", orderStatuses);

    return (
        <div className="my-6 flex gap-3">
            <div className="relative min-w-0 flex-1">
                <Search
                    className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500"
                />

                <input
                    value={searchOrder}
                    onChange={(event) =>
                        onSearchChangeAction(
                            event.target.value
                        )
                    }
                    placeholder="Search by order ID, customer name or email..."
                    className="h-10 w-full border border-zinc-800 bg-dark pl-9 pr-3 font-mono text-xs text-white outline-none placeholder:text-zinc-500 focus:border-second light:border-zinc-300 light:bg-white light:text-zinc-900"
                />
            </div>
            <div className='flex gap-2'>
                <button
                    onClick={(e) => onStatusChangeAction("all")}
                    className='border border-zinc-800 bg-dark px-3 py-1 text-xs font-mono text-white outline-none placeholder:text-zinc-500 focus:border-second light:border-zinc-300 light:bg-white light:text-zinc-900'>
                    All
                </button>
                {
                    orderStatuses.map((status, idx) => (
                        <button key={idx}
                            onClick={(e) => onStatusChangeAction(status.toLowerCase())}
                            className='border border-zinc-800 bg-dark px-3 py-1 text-xs font-mono text-white outline-none placeholder:text-zinc-500 focus:border-second light:border-zinc-300 light:bg-white light:text-zinc-900'>
                            {status}
                        </button>
                    ))
                }
            </div>
        </div>
    )
}
