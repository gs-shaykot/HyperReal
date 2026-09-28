import prisma from "@/lib/prisma";
import { addMonths, startOfMonth, subMonths } from "date-fns";

export async function getProductsStat() {
    const now = new Date();

    // Current month 
    const currentMonthStart = startOfMonth(now);

    // Next month
    const nextMonthDate = addMonths(currentMonthStart, 1);
    const nextMonthStart = startOfMonth(nextMonthDate);

    // Previous month
    const previousMonth = subMonths(now, 1);
    const previousMonthStart = startOfMonth(previousMonth);

    // 1. Total products
    const total = await prisma.product.count();

    // 2. Products created this month
    const thisMonth = await prisma.product.count({
        where: {
            createdAt: {
                gte: currentMonthStart,
                lt: nextMonthStart,
            },
        },
    });

    // 3. Products created previous month
    const previousMonthProducts = await prisma.product.count({
        where: {
            createdAt: {
                gte: previousMonthStart,
                lt: currentMonthStart,
            },
        },
    });

    // 4. Calculate growth
    const growth = previousMonthProducts === 0 ? null :
        Number(
            (((thisMonth - previousMonthProducts) / previousMonthProducts) * 100).toFixed(1)
        )

    // 5. Return dashboard data
    return {
        total: total.toFixed(0),
        thisMonth: thisMonth.toFixed(0),
        previousMonth: previousMonthProducts.toFixed(0),
        growth,
    }
}