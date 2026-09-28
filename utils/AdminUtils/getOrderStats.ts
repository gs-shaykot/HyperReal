import prisma from '@/lib/prisma';
import { addMonths, startOfMonth, subMonths } from 'date-fns';

export async function getOrderStats() {
    const now = new Date();

    // Current month 
    const currentMonthStart = startOfMonth(now);

    // Next month
    const nextMonthDate = addMonths(currentMonthStart, 1);
    const nextMonthStart = startOfMonth(nextMonthDate);

    // Previous month
    const previousMonth = subMonths(now, 1);
    const previousMonthStart = startOfMonth(previousMonth);


    // 1. Lifetime orders
    const total = await prisma.order.count({
        where: {
            status: {
                not: "CANCELLED",
            },
        },
    });

    // 2. Current-month orders
    const thisMonth = await prisma.order.count({
        where: {
            status: {
                not: "CANCELLED",
            },
            createdAt: {
                gte: currentMonthStart,
                lt: nextMonthStart,
            },
        },
    });

    // 3. Previous-month orders
    const previousMonthOrders = await prisma.order.count({
        where: {
            status: {
                not: "CANCELLED",
            },
            createdAt: {
                gte: previousMonthStart,
                lt: currentMonthStart,
            },
        },
    });

    // 4. Calculate growth
    const growth = previousMonthOrders === 0 ? null :
        Number(
            (((thisMonth - previousMonthOrders) / previousMonthOrders) * 100).toFixed(1)
        )

    // 5. Return dashboard data
    return {
        total,
        thisMonth,
        previousMonth: previousMonthOrders,
        growth,
    };
}
