import type { Role } from "@prisma/client";

export type AdminUser = {
    id: string;
    name: string;
    email: string;
    PhotoUrl: string | null;
    role: Role;
    isBlocked: boolean;
    createdAt: Date | string;
    ordersCount: number;
    totalSpent: number;
};
