
"use client";

import axios from "axios";
import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import type { Role } from "@prisma/client";
import type { AdminUser } from "@/app/types/AdminUser";
import toast from "react-hot-toast";

type UpdateAdminUserInput = {
    id: string;
} & (
    | { role: Role | "CUSTOMER"; isBlocked?: never }
    | { isBlocked: boolean; role?: never }
);

async function updateAdminUser(input: UpdateAdminUserInput) {
    try {
        const { data } = await axios.patch(
            "/api/admin/users",
            input
        );

        return data.data as Partial<AdminUser> & { id: string };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(
                error.response?.data?.message ??
                    "Failed to update user"
            );
        }

        throw error;
    }
}

export function useUpdateAdminUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateAdminUser,

        onMutate: async (input) => {
            await queryClient.cancelQueries({
                queryKey: ["admin-users"],
            });

            const previous = queryClient.getQueriesData({
                queryKey: ["admin-users"],
            });

            queryClient.setQueriesData(
                { queryKey: ["admin-users"] },
                (old: any) => {
                    if (!old?.users) return old;

                    return {
                        ...old,
                        users: old.users.map(
                            (user: AdminUser) => {
                                if (user.id !== input.id) {
                                    return user;
                                }

                                if ("role" in input && input.role) {
                                    return {
                                        ...user,
                                        role:
                                            input.role === "CUSTOMER"
                                                ? "USER"
                                                : input.role,
                                    };
                                }

                                if ("isBlocked" in input) {
                                    return {
                                        ...user,
                                        isBlocked: input.isBlocked,
                                    };
                                }

                                return user;
                            }
                        ),
                    };
                }
            );

            return { previous };
        },

        onError: (error, _, context) => {
            context?.previous.forEach(([key, data]) => {
                queryClient.setQueryData(key, data);
            });

            toast.error(error.message);
        },

        onSuccess: () => {
            toast.success("User updated successfully");
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["admin-users"],
            });
        },
    });
}
