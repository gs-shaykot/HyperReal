
"use client";

import { CalendarDays, HandCoins, Shield, UserRound, X } from "lucide-react";
import type { Role } from "@prisma/client";
import type { AdminUser } from "@/app/types/AdminUser";
import { useUpdateAdminUser } from "@/app/Hooks/useAdminUsers";

type UserDetailsSidebarProps = {
    user: AdminUser | null;
    onCloseAction: () => void;
};

const roles: { value: Role | "CUSTOMER"; label: string }[] = [
    { value: "ADMIN", label: "Admin" },
    { value: "MANAGER", label: "Manager" },
    { value: "CUSTOMER", label: "Customer" },
];

export const UserDetailsSidebar = ({
    user,
    onCloseAction,
}: UserDetailsSidebarProps) => {
    const updateUser = useUpdateAdminUser();

    if (!user) return null;

    const displayRole = user.role === "USER" ? "CUSTOMER" : user.role;

    return (
        <>
            <button
                type="button"
                aria-label="Close user details"
                onClick={onCloseAction}
                className="fixed inset-0 z-40 cursor-default bg-black/60"
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-labelledby="user-details-title"
                className="fixed inset-y-0 right-0 z-50 flex w-full max-w-110 flex-col border-l border-zinc-800 bg-[#0c0c0c] text-white shadow-2xl light:border-zinc-200 light:bg-white light:text-zinc-900"
            >
                <header className="flex items-center justify-between border-b border-zinc-800 px-5 py-5 light:border-zinc-200">
                    <div>
                        <h2
                            id="user-details-title"
                            className="text-xs font-bold uppercase tracking-[0.15em]"
                        >
                            User Details
                        </h2>
                        <p className="mt-1 font-mono text-[10px] text-zinc-500">
                            {user.id}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onCloseAction}
                        aria-label="Close"
                        className="text-zinc-400 hover:text-white light:hover:text-zinc-900"
                    >
                        <X className="size-4" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-5">
                    <section className="flex items-center gap-4 border-b border-dashed border-zinc-800 pb-6 light:border-zinc-200">
                        {user.PhotoUrl ? (
                            <img
                                src={user.PhotoUrl}
                                alt=""
                                className="size-16 border border-zinc-800 object-cover light:border-zinc-200"
                            />
                        ) : (
                            <div className="flex size-16 items-center justify-center border border-zinc-800 bg-second/10 font-mono text-lg font-bold text-second">
                                {user.name
                                    .split(/\s+/)
                                    .slice(0, 2)
                                    .map((part) => part[0])
                                    .join("")
                                    .toUpperCase()}
                            </div>
                        )}

                        <div className="min-w-0">
                            <h3 className="text-sm font-bold">
                                {user.name}
                            </h3>
                            <p className="mt-1 break-all font-mono text-[10px] text-zinc-500">
                                {user.email}
                            </p>
                            <span
                                className={`mt-3 inline-flex border px-2 py-1 text-[9px] font-bold uppercase ${user.isBlocked
                                        ? "border-red-700/60 bg-red-500/10 text-red-400"
                                        : "border-lime-700/60 bg-lime-500/10 text-lime-400"
                                    }`}
                            >
                                {user.isBlocked ? "Blocked" : "Active"}
                            </span>
                        </div>
                    </section>

                    <section className="mt-6">
                        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            Account Overview
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="border border-zinc-800 p-4 light:border-zinc-200">
                                <p className="text-[9px] uppercase text-zinc-500">
                                    Total Orders
                                </p>
                                <p className="mt-2 font-mono text-xl font-bold">
                                    {user.ordersCount}
                                </p>
                            </div>

                            <div className="border border-zinc-800 p-4 light:border-zinc-200">
                                <p className="text-[9px] uppercase text-zinc-500">
                                    Total Spent
                                </p>
                                <p className="mt-2 font-mono text-xl font-bold text-second">
                                    ${user.totalSpent.toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="mt-3 flex items-center gap-3 border border-zinc-800 p-4 light:border-zinc-200">
                            <CalendarDays className="size-4 text-zinc-500" />
                            <div>
                                <p className="text-[9px] uppercase text-zinc-500">
                                    Joined
                                </p>
                                <p className="mt-1 font-mono text-xs">
                                    {new Date(user.createdAt).toLocaleDateString("en-CA")}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="mt-7">
                        <h3 className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            <UserRound className="size-3.5" />
                            Access Control
                        </h3>

                        <label
                            htmlFor="user-role"
                            className="mb-2 block font-mono text-[10px] text-zinc-500"
                        >
                            Account Role
                        </label>

                        <select
                            id="user-role"
                            value={displayRole}
                            disabled={updateUser.isPending}
                            onChange={(event) =>
                                updateUser.mutate({
                                    id: user.id,
                                    role: event.target.value as Role | "CUSTOMER",
                                })
                            }
                            className="h-10 w-full border border-zinc-800 bg-dark px-3 font-mono text-xs text-white outline-none focus:border-second disabled:opacity-50 light:border-zinc-300 light:bg-white light:text-zinc-900"
                        >
                            {roles.map((role) => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            disabled={updateUser.isPending}
                            onClick={() =>
                                updateUser.mutate({
                                    id: user.id,
                                    isBlocked: !user.isBlocked,
                                })
                            }
                            className={`mt-4 flex h-10 w-full items-center justify-center gap-2 border font-mono text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer ${user.isBlocked
                                    ? "border-lime-700/60 text-lime-400 hover:bg-lime-500/10"
                                    : "border-red-700/60 text-red-400 hover:bg-red-500/10"
                                }`}
                        >
                            <Shield className="size-3.5" />
                            {user.isBlocked ? "Unblock Account" : "Block Account"}
                        </button>

                        <button
                            type="button"
                            disabled={updateUser.isPending}
                            onClick={() =>
                                updateUser.mutate({
                                    id: user.id,
                                    isCODDisabled: !user.isCODDisabled,
                                })
                            }
                            className={`mt-3 flex h-10 w-full items-center justify-center gap-2 border font-mono text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer ${user.isCODDisabled
                                    ? "border-lime-700/60 text-lime-400 hover:bg-lime-500/10"
                                    : "border-amber-700/60 text-amber-400 hover:bg-amber-500/10"
                                }`}
                        >
                            <HandCoins className="size-3.5" />
                            {user.isCODDisabled
                                ? "Enable Cash on Delivery"
                                : "Disable Cash on Delivery"}
                        </button>

                        <p className="mt-3 font-mono text-[9px] leading-relaxed text-zinc-500">
                            Role changes affect permissions. Blocking an account
                            must also be enforced by authentication and session
                            validation.
                        </p>
                    </section>
                </div>
            </aside>
        </>
    );
};
