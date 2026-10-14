
import prisma from "@/lib/prisma";
import {
    addMonths,
    format,
    startOfMonth,
    subMonths,
} from "date-fns";

export async function getAnalyticsData() {
    const now = new Date();
    const currentMonth = startOfMonth(now);
    const chartStart = startOfMonth(subMonths(currentMonth, 11));
    const nextMonth = addMonths(currentMonth, 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);

    const [
        payments,
        orders,
        users,
        totalCustomers,
        totalOrders,
        currentYearPayments,
        lastYearPayments,
        paidOrderItems,
    ] = await Promise.all([
        prisma.payment.findMany({
            where: {
                status: "SUCCESS",
                createdAt: { gte: chartStart, lt: nextMonth },
            },
            select: {
                orderId: true,
                createdAt: true,
                paidAmountInUSD: true,
            },
        }),
        prisma.order.findMany({
            where: {
                createdAt: { gte: chartStart, lt: nextMonth },
            },
            select: { createdAt: true },
        }),
        prisma.user.findMany({
            where: {
                role: "USER",
                createdAt: { lt: nextMonth },
            },
            select: { createdAt: true },
        }),
        prisma.user.count({ where: { role: "USER" } }),
        prisma.order.count(),
        prisma.payment.findMany({
            where: {
                status: "SUCCESS",
                createdAt: { gte: yearStart, lt: nextMonth },
            },
            select: { orderId: true, paidAmountInUSD: true },
        }),
        prisma.payment.findMany({
            where: {
                status: "SUCCESS",
                createdAt: { gte: lastYearStart, lt: yearStart },
            },
            select: { orderId: true, paidAmountInUSD: true },
        }),
        prisma.orderItem.findMany({
            where: {
                order: {
                    payments: {
                        some: { status: "SUCCESS" },
                    },
                },
            },
            select: {
                quantity: true,
                priceAtPurchase: true,
                variant: {
                    select: {
                        product: {
                            select: {
                                category: {
                                    select: { name: true },
                                },
                            },
                        },
                    },
                },
            },
        }),
    ]);

    const months = Array.from({ length: 12 }, (_, index) => {
        const monthDate = addMonths(chartStart, index);
        const monthKey = format(monthDate, "yyyy-MM");

        const monthPayments = payments.filter(
            (payment) =>
                format(payment.createdAt, "yyyy-MM") === monthKey
        );

        const monthOrders = orders.filter(
            (order) =>
                format(order.createdAt, "yyyy-MM") === monthKey
        );

        const revenue = monthPayments.reduce(
            (sum, payment) => sum + payment.paidAmountInUSD,
            0
        );

        const paidOrderCount = new Set(
            monthPayments.map((payment) => payment.orderId)
        ).size;

        const cumulativeUsers = users.filter(
            (user) => user.createdAt < addMonths(monthDate, 1)
        ).length;

        return {
            month: format(monthDate, "MMM"),
            revenue: Number(revenue.toFixed(2)),
            orders: monthOrders.length,
            cumulativeUsers,
            // This is a proxy, not visitor-to-purchase conversion.
            orderRate: totalCustomers
                ? Number(
                    ((monthOrders.length / totalCustomers) * 100).toFixed(2)
                )
                : 0,
            paidOrderCount,
        };
    });

    const sumPayments = (
        items: { orderId: string; paidAmountInUSD: number }[]
    ) =>
        items.reduce((sum, payment) => sum + payment.paidAmountInUSD, 0);

    const currentYearRevenue = sumPayments(currentYearPayments);
    const lastYearRevenue = sumPayments(lastYearPayments);

    const currentYearPaidOrders = new Set(
        currentYearPayments.map((payment) => payment.orderId)
    ).size;

    const totalPaidOrders = new Set(
        payments.map((payment) => payment.orderId)
    ).size;

    const totalRevenue = sumPayments(payments);

    const categoryTotals = new Map<string, number>();

    for (const item of paidOrderItems) {
        const category =
            item.variant.product.category.name;

        const itemRevenue =
            item.priceAtPurchase * item.quantity;

        categoryTotals.set(
            category,
            (categoryTotals.get(category) ?? 0) + itemRevenue
        );
    }

    const topCategory = [...categoryTotals.entries()].sort(
        (a, b) => b[1] - a[1]
    )[0];

    const annualGrowth =
        lastYearRevenue > 0
            ? Number(
                (
                    ((currentYearRevenue - lastYearRevenue) /
                        lastYearRevenue) *
                    100
                ).toFixed(1)
            )
            : null;

    const currentMonthRevenue =
        months[months.length - 1]?.revenue ?? 0;

    const previousMonthRevenue =
        months[months.length - 2]?.revenue ?? 0;

    const monthlyGrowth =
        previousMonthRevenue > 0
            ? Number(
                (
                    ((currentMonthRevenue - previousMonthRevenue) /
                        previousMonthRevenue) *
                    100
                ).toFixed(1)
            )
            : null;

    const avgOrderValue =
        totalPaidOrders > 0
            ? totalRevenue / totalPaidOrders
            : 0;

    return {
        months,
        totalRevenue,
        avgOrderValue,
        totalOrders,
        totalCustomers,
        totalPaidOrders,
        currentYearRevenue,
        annualGrowth,
        monthlyGrowth,
        topCategory: topCategory
            ? {
                name: topCategory[0],
                revenue: topCategory[1],
                share: totalRevenue > 0
                    ? (topCategory[1] / totalRevenue) * 100
                    : 0,
            }
            : null,
        orderRate: totalCustomers
            ? (totalOrders / totalCustomers) * 100
            : 0,
        currentYearPaidOrders,
    };
}
