import prisma from "@/lib/prisma";
import {
    startOfMonth,
    addMonths,
    subMonths,
} from "date-fns"

export async function getRevenueStats() {

    const now = new Date();

    // Current month 
    const currentMonthStart = startOfMonth(now);

    // Next month
    const nextMonthDate = addMonths(currentMonthStart, 1);
    const nextMonthStart = startOfMonth(nextMonthDate);

    // Previous month
    const previousMonth = subMonths(now, 1);
    const previousMonthStart = startOfMonth(previousMonth);

    // 1. Lifetime revenue
    const lifetimeRevenue = await prisma.payment.aggregate({
        where: {
            status: "SUCCESS"
        },
        _sum: {
            paidAmountInUSD: true,
        }
    });

    // 2. Current-month revenue
    const currentMonthRevenue = await prisma.payment.aggregate({
        where: {
            status: "SUCCESS",
            createdAt: {
                gte: currentMonthStart,
                lt: nextMonthStart,
            },
        },
        _sum: {
            paidAmountInUSD: true,
        },
    });


    // 3. Previous-month revenue
    const previousMonthRevenue = await prisma.payment.aggregate({
        where: {
            status: "SUCCESS",
            createdAt: {
                gte: previousMonthStart,
                lt: currentMonthStart,
            },
        },
        _sum: {
            paidAmountInUSD: true,
        },
    });


    const totalRevenue = lifetimeRevenue._sum.paidAmountInUSD ?? 0

    const thisMonthRevenue = currentMonthRevenue._sum.paidAmountInUSD ?? 0

    const lastMonthRevenue = previousMonthRevenue._sum.paidAmountInUSD ?? 0

    // 4. Calculate growth
    const growth = lastMonthRevenue === 0 ? null :
        Number(
            (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
        )

    // 5. Return clean dashboard data
    return {
        totalRevenue,
        thisMonthRevenue,
        lastMonthRevenue,
        growth,
    }
}   