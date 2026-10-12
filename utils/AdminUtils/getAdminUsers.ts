
import prisma from "@/lib/prisma";
import { PaymentStatus, Role } from "@prisma/client";

const USERS_PER_PAGE = 10;

export type AdminUserStatus = "ALL" | "ACTIVE" | "BLOCKED";

export type AdminUserSort =
    | "NEWEST"
    | "OLDEST"
    | "TOP_SPENDERS"
    | "MOST_ORDERS"
    | "NAME_A_Z";

type GetAdminUsersParams = {
    search?: string;
    role?: Role;
    status?: AdminUserStatus;
    sort?: AdminUserSort;
    page?: number;
};

export async function getAdminUsers({
    search = "",
    role,
    status = "ALL",
    sort = "NEWEST",
    page = 1,
}: GetAdminUsersParams = {}) {
    const normalizedSearch = search.trim();

    const where = {
        ...(normalizedSearch
            ? {
                OR: [
                    {
                        name: {
                            contains: normalizedSearch,
                            mode: "insensitive" as const,
                        },
                    },
                    {
                        email: {
                            contains: normalizedSearch,
                            mode: "insensitive" as const,
                        },
                    },
                ],
            }
            : {}),

        ...(role ? { role } : {}),

        ...(status === "ACTIVE" ?
            { isBlocked: false }
            : status === "BLOCKED"
                ? { isBlocked: true }
                : {}),
    };

    const safePage = Number.isFinite(page)
        ? Math.max(1, Math.floor(page))
        : 1;

    const skip = (safePage - 1) * USERS_PER_PAGE;

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            ...(sort === "NEWEST"
                ? { orderBy: { createdAt: "desc" as const } }
                : sort === "OLDEST"
                    ? { orderBy: { createdAt: "asc" as const } }
                    : sort === "NAME_A_Z"
                        ? { orderBy: { name: "asc" as const } }
                        : {}),
            ...(sort === "TOP_SPENDERS" || sort === "MOST_ORDERS" ? {}
                : {
                    skip,
                    take: USERS_PER_PAGE,
                }),

            select: {
                id: true,
                name: true,
                email: true,
                PhotoUrl: true,
                role: true,
                isBlocked: true,
                isCODDisabled: true,
                createdAt: true,

                _count: {
                    select: {
                        orders: true,
                    },
                },

                orders: {
                    select: {
                        payments: {
                            where: {
                                status: PaymentStatus.SUCCESS,
                            },
                            select: {
                                paidAmountInUSD: true,
                            },
                        },
                    },
                },
            },
        }),

        prisma.user.count({ where }),
    ]);

    const formattedUsers = users.map((user) => {
        const totalSpent = user.orders.reduce(
            (sum, order) =>
                sum +
                order.payments.reduce(
                    (paymentSum, payment) =>
                        paymentSum + payment.paidAmountInUSD,
                    0
                ),
            0
        );

        const { orders, _count, ...userData } = user;

        return {
            ...userData,
            ordersCount: _count.orders,
            totalSpent,
        };
    });

    if (sort === "TOP_SPENDERS") {
        formattedUsers.sort(
            (a, b) => b.totalSpent - a.totalSpent
        );
    }

    if (sort === "MOST_ORDERS") {
        formattedUsers.sort(
            (a, b) => b.ordersCount - a.ordersCount
        );
    }

    const paginatedUsers =
        sort === "TOP_SPENDERS" ||
            sort === "MOST_ORDERS"
            ? formattedUsers.slice(skip, skip + USERS_PER_PAGE)
            : formattedUsers;

    return {
        users: paginatedUsers,
        total,
        page: safePage,
        totalPages: Math.max(
            1,
            Math.ceil(total / USERS_PER_PAGE)
        ),
        pageSize: USERS_PER_PAGE,
    };
}
