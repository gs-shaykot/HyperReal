
"use client";

import { Search } from "lucide-react";

const roles = ["ALL", "ADMIN", "MANAGER", "CUSTOMER"] as const;

type UsersToolbarProps = {
    search: string;
    role: string;
    onSearchChangeAction: (value: string) => void;
    onRoleChangeAction: (value: string) => void;
};

export const UsersToolbar = ({
    search,
    role,
    onSearchChangeAction,
    onRoleChangeAction,
}: UsersToolbarProps) => {
    return (
        <div className="my-6 flex flex-wrap gap-2.5">
            <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />

                <input
                    value={search}
                    onChange={(event) =>
                        onSearchChangeAction(event.target.value)
                    }
                    placeholder="Search by name or email..."
                    className="h-10 w-full border border-zinc-800 bg-dark pl-9 pr-3 font-mono text-xs text-white outline-none placeholder:text-zinc-500 focus:border-second light:border-zinc-300 light:bg-white light:text-zinc-900"
                />
            </div>

            <div className="flex flex-wrap gap-1.5">
                {roles.map((item) => (
                    <button
                        key={item}
                        type="button"
                        onClick={() => onRoleChangeAction(item)}
                        className={`h-10 border px-3 font-mono text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${role === item
                                ? "border-second bg-second text-black"
                                : "border-zinc-800 text-zinc-400 hover:border-zinc-600 light:border-zinc-300"
                            }`}
                    >
                        {item}
                    </button>
                ))}
            </div>
        </div>
    );
};
