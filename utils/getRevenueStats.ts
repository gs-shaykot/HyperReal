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
    // suppose i have totalProductPriceInUSD & shippingCost field in payment model which is saved in neon database. i want the total
    const lifetimeRevenue = await prisma.payment.aggregate({
        where: {
            status: "SUCCESS"
        },
        _sum: {
            totalProductPriceInUSD: true,
        }
    });
}   