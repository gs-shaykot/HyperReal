import { OverviewStatCard } from '@/app/components/admin_component/OverviewStatCard'
import { RevenueOverview } from '@/app/components/admin_component/RevenueOverview'
import { getOrderStats } from '@/utils/AdminUtils/getOrderStats'
import { getProductsStat } from '@/utils/AdminUtils/getProductsStat'
import { getRevenueStats } from '@/utils/AdminUtils/getRevenueStats'
import { getUserStats } from '@/utils/AdminUtils/getUserStats'
import { getRevenueChartData } from "@/utils/AdminUtils/getRevenueChartData";
import { ChartNoAxesCombined, Package, ShoppingCart, UsersRound } from 'lucide-react'
import { getSalesByCategory } from '@/utils/AdminUtils/getSalesByCategory'
import { SalesByCategory } from '@/app/components/admin_component/SalesByCategory'
import { getRecentOrders } from '@/utils/AdminUtils/getRecentOrders'
import { getTopProducts } from '@/utils/AdminUtils/getTopProducts'
import { RecentOrders } from '@/app/components/admin_component/RecentOrders'
import { TopProducts } from '@/app/components/admin_component/TopProducts'

const DashboardPage = async () => {

    const [revenue, orders, users, products, monthlyRevenue, weeklyRevenue, salesByCategory, recentOrders, topProducts,] = await Promise.all([
        getRevenueStats(),
        getOrderStats(),
        getUserStats(),
        getProductsStat(),
        getRevenueChartData("monthly"),
        getRevenueChartData("weekly"),
        getSalesByCategory(),
        getRecentOrders(),
        getTopProducts(),
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
        <div className="min-h-screen bg-main p-4 light:bg-white">
            <div className="grid w-full grid-cols-1 gap-4 shadow-md sm:grid-cols-2 lg:grid-cols-4">
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

            <div className='w-full grid grid-cols-1 md:grid-cols-[13fr_7fr] gap-4 mt-4'>
                <RevenueOverview monthlyData={monthlyRevenue} weeklyData={weeklyRevenue} />
                <SalesByCategory
                    data={salesByCategory}
                />
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4 mt-4">
                <RecentOrders
                    orders={recentOrders.orders}
                    total={recentOrders.total}
                />

                <TopProducts
                    data={topProducts}
                />
            </div>
        </div>
    )
}
export default DashboardPage