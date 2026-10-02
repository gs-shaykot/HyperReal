import prisma from "@/lib/prisma";
import { eachDayOfInterval, eachMonthOfInterval, endOfDay, endOfMonth, endOfWeek, format, startOfDay, startOfMonth, startOfWeek, subMonths } from "date-fns";

export type RevenuePeriod = "weekly" | "monthly";

export async function getRevenueChartData(period: RevenuePeriod) {
    const now = new Date();

    //  Weekly revenue chart data
    if (period === "weekly") {
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

        const payments = await prisma.payment.findMany({
            where: {
                status: "SUCCESS",
                createdAt: {
                    gte: weekStart,
                    lte: weekEnd
                }
            },
            select: {
                paidAmountInUSD: true,
                createdAt: true
            }
        });

        const days = eachDayOfInterval({
            start: weekStart,
            end: weekEnd
        });

        return days.map(day => {
            const dayStart = startOfDay(day);
            const dayEnd = endOfDay(day);

            const revenue = payments.filter(payment =>
                payment.createdAt >= dayStart &&
                payment.createdAt <= dayEnd
            ).reduce((total, payment) => total + payment.paidAmountInUSD, 0);

            return {
                label: format(day, "EEE"),
                revenue: Number(revenue.toFixed(2)),
            };
        })
    }

    // Monthly revenue chart data
    const chartStart = startOfMonth(
        subMonths(now, 11)
    );

    const chartEnd = endOfMonth(now);

    const payments = await prisma.payment.findMany({
        where: {
            status: "SUCCESS",
            createdAt: {
                gte: chartStart,
                lte: chartEnd,
            },
        },
        select: {
            paidAmountInUSD: true,
            createdAt: true,
        },
    });

    const months = eachMonthOfInterval({
        start: chartStart,
        end: chartEnd,
    });

    return months.map((month) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);

        const revenue = payments
            .filter(
                (payment) =>
                    payment.createdAt >= monthStart &&
                    payment.createdAt <= monthEnd
            )
            .reduce(
                (total, payment) =>
                    total + payment.paidAmountInUSD,
                0
            );

        return {
            label: format(month, "MMM"),
            revenue: Number(revenue.toFixed(2)),
        };
    });

}