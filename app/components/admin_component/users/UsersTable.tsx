"use client"; 
import { Eye, HandCoins, Shield, ShieldCheck } from "lucide-react";
import type { Role } from "@prisma/client";
import type { AdminUser } from "@/app/types/AdminUser";
import { useUpdateAdminUser } from "@/app/Hooks/useAdminUsers";

type UsersTableProps = {
    users: AdminUser[];
    onSelectUserAction: (user: AdminUser) => void;
};

function getRoleLabel(role: Role) {
    return role === "USER" ? "CUSTOMER" : role;
}

function roleClass(role: Role) {
    switch (role) {
        case "ADMIN":
            return "border-purple-700/60 bg-purple-500/10 text-purple-400";
        case "MANAGER":
            return "border-blue-700/60 bg-blue-500/10 text-blue-400";
        default:
            return "border-zinc-700 bg-zinc-800/70 text-zinc-400";
    }
}

export const UsersTable = ({
    users,
    onSelectUserAction,
}: UsersTableProps) => {
    const updateUser = useUpdateAdminUser();

    return (
        <div className="overflow-x-auto border border-zinc-800 light:border-zinc-200">
            <table className="w-full min-w-212.5 border-collapse">
                <thead>
                    <tr className="bg-white/2.5">
                        {[
                            "User",
                            "Role",
                            "Orders",
                            "Total Spent",
                            "Joined",
                            "Status",
                            "Actions",
                        ].map((heading) => (
                            <th
                                key={heading}
                                className={`px-3 py-4 text-left font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500 ${heading === "Actions" ? "text-right" : ""
                                    }`}
                            >
                                {heading}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {users.length > 0 ? (
                        users.map((user) => (
                            <tr
                                key={user.id}
                                className="border-t border-zinc-800 hover:bg-white/2.5 light:border-zinc-200"
                            >
                                <td className="px-3 py-3.5">
                                    <div className="flex items-center gap-3">
                                        {user.PhotoUrl ? (
                                            <img
                                                referrerPolicy="no-referrer"
                                                src={user.PhotoUrl}
                                                alt=""
                                                className="size-8 shrink-0 border border-zinc-800 object-cover light:border-zinc-200"
                                            />
                                        ) : (
                                            <div className="flex size-8 shrink-0 items-center justify-center bg-second/20 font-mono text-[10px] font-bold text-second">
                                                {user.name
                                                    .split(/\s+/)
                                                    .slice(0, 2)
                                                    .map((part) => part[0])
                                                    .join("")
                                                    .toUpperCase()}
                                            </div>
                                        )}

                                        <div className="min-w-0">
                                            <p className="text-[11px] font-bold text-white light:text-zinc-900">
                                                {user.name}
                                            </p>
                                            <p className="mt-0.5 break-all font-mono text-[9px] text-zinc-500">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-3 py-3.5">
                                    <span
                                        className={`inline-flex border px-2 py-1 text-[9px] font-bold uppercase ${roleClass(user.role)}`}
                                    >
                                        {getRoleLabel(user.role)}
                                    </span>
                                </td>

                                <td className="px-3 py-3.5 font-mono text-[10px] font-bold">
                                    {user.ordersCount}
                                </td>

                                <td className="px-3 py-3.5 font-mono text-[10px] font-bold text-white light:text-zinc-900">
                                    ${user.totalSpent.toLocaleString("en-US", {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 2,
                                    })}
                                </td>

                                <td className="whitespace-nowrap px-3 py-3.5 font-mono text-[10px] text-zinc-400">
                                    {new Date(user.createdAt).toLocaleDateString("en-CA")}
                                </td>

                                <td className="px-3 py-3.5">
                                    <span
                                        className={`inline-flex border px-2 py-1 text-[9px] font-bold uppercase ${user.isBlocked
                                            ? "border-red-700/60 bg-red-500/10 text-red-400"
                                            : "border-lime-700/60 bg-lime-500/10 text-lime-400"
                                            }`}
                                    >
                                        {user.isBlocked ? "BLOCKED" : "ACTIVE"}
                                    </span>
                                </td>

                                <td className="px-3 py-3.5">
                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            type="button"
                                            title="View user details"
                                            aria-label={`View ${user.name}`}
                                            onClick={() =>
                                                onSelectUserAction(user)
                                            }
                                            className="text-zinc-500 transition-colors hover:text-white light:hover:text-zinc-900 cursor-pointer"
                                        >
                                            <Eye className="size-4  cursor-pointer" />
                                        </button>

                                        <button
                                            type="button"
                                            title={
                                                user.isBlocked
                                                    ? "Unblock user"
                                                    : "Block user"
                                            }
                                            aria-label={
                                                user.isBlocked
                                                    ? `Unblock ${user.name}`
                                                    : `Block ${user.name}`
                                            }
                                            disabled={updateUser.isPending}
                                            onClick={() =>
                                                updateUser.mutate({
                                                    id: user.id,
                                                    isBlocked: !user.isBlocked,
                                                })
                                            }
                                            className={`transition-colors disabled:opacity-40 text-zinc-500 hover:text-red-500 cursor-pointer${user.isBlocked
                                                ? "text-second"
                                                : ""
                                                }`}
                                        >
                                            {user.isBlocked ? (
                                                <ShieldCheck className="size-4 text-red-500 cursor-pointer" />
                                            ) : (
                                                <Shield className="size-4  cursor-pointer" />
                                            )}
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
                                            className={`transition-colors light:hover:text-zinc-900  cursor-pointer hover:text-orange-400 ${user.isCODDisabled ? "text-orange-400" : "text-zinc-500"}`}
                                        >
                                            <HandCoins className="size-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={7}
                                className="px-4 py-16 text-center font-mono text-xs text-zinc-500"
                            >
                                NO USERS FOUND
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
