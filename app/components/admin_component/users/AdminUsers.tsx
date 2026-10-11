
"use client";

import axios from "axios";
import {
    keepPreviousData,
    useQuery,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { AdminUser } from "@/app/types/AdminUser";
import type {
    AdminUserSort,
    AdminUserStatus,
} from "@/utils/AdminUtils/getAdminUsers";
import { UsersToolbar } from "./UsersToolbar";
import { UsersTable } from "./UsersTable";
import { UserDetailsSidebar } from "./UserDetailsSidebar";
import { UsersPagination } from "@/app/components/admin_component/users/UsersPagination";

type AdminUsersProps = {
    initialUsers: AdminUser[];
    initialTotal: number;
    initialTotalPages: number;
};

export const AdminUsers = ({
    initialUsers,
    initialTotal,
    initialTotalPages,
}: AdminUsersProps) => {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [role, setRole] = useState("ALL");
    const [status, setStatus] = useState<AdminUserStatus>("ALL");
    const [sort, setSort] = useState<AdminUserSort>("NEWEST");
    const [page, setPage] = useState(1);
    const [selectedUserId, setSelectedUserId] =
        useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setPage(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleRoleChange = (value: string) => {
        setRole(value);
        setPage(1);
    };

    const handleStatusChange = (value: AdminUserStatus) => {
        setStatus(value);
        setPage(1);
    };

    const handleSortChange = (value: AdminUserSort) => {
        setSort(value);
        setPage(1);
    };

    const { data, isFetching } = useQuery({
        queryKey: [
            "admin-users",
            debouncedSearch,
            role,
            status,
            sort,
            page,
        ],

        queryFn: async () => {
            const params = new URLSearchParams();

            if (debouncedSearch) {
                params.set("search", debouncedSearch);
            }

            if (role !== "ALL") {
                params.set("role", role);
            }

            params.set("status", status);
            params.set("sort", sort);
            params.set("page", String(page));

            const res = await axios.get(
                `/api/admin/users?${params.toString()}`
            );

            return res.data.data;
        },

        initialData:
            page === 1 &&
            !debouncedSearch &&
            role === "ALL" &&
            status === "ALL" &&
            sort === "NEWEST"
                ? {
                      users: initialUsers,
                      total: initialTotal,
                      page: 1,
                      totalPages: initialTotalPages,
                  }
                : undefined,

        placeholderData: keepPreviousData,
    });

    const users: AdminUser[] = data?.users ?? initialUsers;
    const total = data?.total ?? initialTotal;
    const totalPages = data?.totalPages ?? initialTotalPages;

    const selectedUser =
        users.find((user) => user.id === selectedUserId) ?? null;

    useEffect(() => {
        if (data && page > data.totalPages) {
            setPage(data.totalPages);
        }
    }, [data, page]);

    return (
        <div className="min-h-screen bg-main light:bg-white">
            <h1 className="text-lg font-bold tracking-[0.08em] text-white light:text-zinc-900">
                USERS
            </h1>

            <p className="mt-1 font-mono text-xs text-zinc-500">
                {total} {total === 1 ? "user" : "users"}
            </p>

            <UsersToolbar
                search={search}
                role={role}
                status={status}
                sort={sort}
                onSearchChangeAction={setSearch}
                onRoleChangeAction={handleRoleChange}
                onStatusChangeAction={handleStatusChange}
                onSortChangeAction={handleSortChange}
            />

            <div className="relative">
                {isFetching && (
                    <div className="absolute right-0 top-2 z-20">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                            Updating...
                        </span>
                    </div>
                )}

                <UsersTable
                    users={users}
                    onSelectUserAction={(user) =>
                        setSelectedUserId(user.id)
                    }
                />
            </div>

            <UsersPagination
                page={page}
                totalPages={totalPages}
                onPageChangeAction={setPage}
            />

            <UserDetailsSidebar
                user={selectedUser}
                onCloseAction={() => setSelectedUserId(null)}
            />
        </div>
    );
};
