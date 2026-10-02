import { OverviewStatCard } from '@/app/components/admin_component/OverviewStatCard'
import { RevenueOverview } from '@/app/components/admin_component/RevenueOverview'
import { getOrderStats } from '@/utils/AdminUtils/getOrderStats'
import { getProductsStat } from '@/utils/AdminUtils/getProductsStat'
import { getRevenueStats } from '@/utils/AdminUtils/getRevenueStats'
import { getUserStats } from '@/utils/AdminUtils/getUserStats'
import { getRevenueChartData } from "@/utils/AdminUtils/getRevenueChartData";
import { ChartNoAxesCombined, Package, ShoppingCart, UsersRound } from 'lucide-react'

const DashboardPage = async () => {

    const [revenue, orders, users, products, monthlyRevenue, weeklyRevenue,] = await Promise.all([
        getRevenueStats(),
        getOrderStats(),
        getUserStats(),
        getProductsStat(),
        getRevenueChartData("monthly"),
        getRevenueChartData("weekly"),
    ]);

    const stats = [
        {
            title: "TOTAL REVENUE",
            value: `$${revenue.totalRevenue}`,
            subtitle: `$${revenue.thisMonthRevenue} this month`,
            change: revenue.growth ?? 0,
            icon: ChartNoAxesCombined,
        },
        {
            title: "TOTAL ORDERS",
            value: orders.total,
            subtitle: `${orders.thisMonth} this month`,
            change: orders.growth ?? 0,
            icon: ShoppingCart,
        },
        {
            title: "ACTIVE USERS",
            value: users.total,
            subtitle: `${users.newThisWeek} new this week`,
            change: users.growth ?? 0,
            icon: UsersRound,
        },
        {
            title: "TOTAL PRODUCTS",
            value: products.total,
            subtitle: `${products.thisMonth} this month`,
            change: products.growth ?? 0,
            icon: Package,
        },
    ];

    return (
        <div className="bg-main light:bg-white min-h-screen ">
            <div className="w-full p-4 shadow-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {
                    stats.map((stat, index) => (
                        <OverviewStatCard
                            key={index}
                            title={stat.title}
                            value={stat.value}
                            subtitle={stat.subtitle}
                            change={stat.change}
                            icon={<stat.icon />}
                        />
                    ))
                }
            </div>
            <RevenueOverview monthlyData={monthlyRevenue} weeklyData={weeklyRevenue} />
        </div>
    )
}
export default DashboardPage