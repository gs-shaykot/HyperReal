
import prisma from "@/lib/prisma";
import { PaymentStatus, Role } from "@prisma/client";

const USERS_PER_PAGE = 10;

type GetAdminUsersParams = {
    search?: string;
    role?: Role;
    page?: number;
};

export async function getAdminUsers({
    search = "",
    role,
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
    };

    const safePage = Number.isFinite(page)
        ? Math.max(1, Math.floor(page))
        : 1;

    const skip = (safePage - 1) * USERS_PER_PAGE;

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: USERS_PER_PAGE,

            select: {
                id: true,
                name: true,
                email: true,
                PhotoUrl: true,
                role: true,
                isBlocked: true,
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

    return {
        users: formattedUsers,
        total,
        page: safePage,
        totalPages: Math.max(
            1,
            Math.ceil(total / USERS_PER_PAGE)
        ),
        pageSize: USERS_PER_PAGE,
    };
}
