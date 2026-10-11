
"use client";

import { Search } from "lucide-react";
import type {
    AdminUserSort,
    AdminUserStatus,
} from "@/utils/AdminUtils/getAdminUsers";

const roles = ["ALL", "ADMIN", "MANAGER", "CUSTOMER"] as const;

const statuses: AdminUserStatus[] = [
    "ALL",
    "ACTIVE",
    "BLOCKED",
];

const sortOptions: {
    label: string;
    value: AdminUserSort;
}[] = [
    { label: "SORT: NEWEST", value: "NEWEST" },
    { label: "SORT: OLDEST", value: "OLDEST" },
    { label: "SORT: TOP SPENDERS", value: "TOP_SPENDERS" },
    { label: "SORT: MOST ORDERS", value: "MOST_ORDERS" },
    { label: "SORT: NAME A-Z", value: "NAME_A_Z" },
];

type UsersToolbarProps = {
    search: string;
    role: string;
    status: AdminUserStatus;
    sort: AdminUserSort;
    onSearchChangeAction: (value: string) => void;
    onRoleChangeAction: (value: string) => void;
    onStatusChangeAction: (value: AdminUserStatus) => void;
    onSortChangeAction: (value: AdminUserSort) => void;
};

export const UsersToolbar = ({
    search,
    role,
    status,
    sort,
    onSearchChangeAction,
    onRoleChangeAction,
    onStatusChangeAction,
    onSortChangeAction,
}: UsersToolbarProps) => {
    const buttonClass = (active: boolean) =>
        `h-10 border px-3 font-mono text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            active
                ? "border-second bg-second text-black"
                : "border-zinc-800 text-zinc-400 hover:border-zinc-600 light:border-zinc-300"
        }`;

    return (
        <div className="my-6 space-y-2">
            {/* Search and role filters */}
            <div className="flex flex-wrap gap-2.5">
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
                            aria-pressed={role === item}
                            onClick={() => onRoleChangeAction(item)}
                            className={buttonClass(role === item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            {/* Account status and sorting */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap gap-1">
                    {statuses.map((item) => (
                        <button
                            key={item}
                            type="button"
                            aria-pressed={status === item}
                            onClick={() => onStatusChangeAction(item)}
                            className={buttonClass(status === item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                <select
                    aria-label="Sort users"
                    value={sort}
                    onChange={(event) =>
                        onSortChangeAction(
                            event.target.value as AdminUserSort
                        )
                    }
                    className="h-10 min-w-46.25 cursor-pointer border border-second bg-dark px-3 font-mono text-[9px] font-bold uppercase tracking-wider text-white outline-none focus:ring-1 focus:ring-second light:bg-white light:text-zinc-900"
                >
                    {sortOptions.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};
