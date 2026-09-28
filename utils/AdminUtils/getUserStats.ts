import prisma from '@/lib/prisma';
import { addMonths, startOfMonth, startOfWeek, subMonths } from 'date-fns';

export async function getUserStats() {
    const now = new Date();
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 })

    // Current month
    const currentMonthStart = startOfMonth(now)

    // 1. Total registered customers
    const total = await prisma.user.count({
        where: {
            role: "USER",
        },
    });

    // 2. New customers this week
    const newThisWeek = await prisma.user.count({
        where: {
            role: "USER",
            createdAt: {
                gte: currentWeekStart,
                lte: now,
            },
        },
    });


    // 3. Customer count at the beginning of this month
    const previousMonthTotal = await prisma.user.count({
        where: {
            role: "USER",
            createdAt: {
                lt: currentMonthStart,
            },
        },
    });

    // 4. Calculate growth
    const growth = previousMonthTotal === 0 ? null :
        Number(
            (((total - previousMonthTotal) / previousMonthTotal) * 100).toFixed(1)
        )


    // 5. Return dashboard data
    return {
        total: total.toFixed(0),
        newThisWeek: newThisWeek.toFixed(0),
        previousMonth: previousMonthTotal.toFixed(0),
        growth,
    }
}
