import { OverviewStatCard } from '@/app/components/admin_component/OverviewStatCard'
import { ChartNoAxesCombined, Package, ShoppingCart, UsersRound } from 'lucide-react'
import React from 'react'

const DashboardPage = () => {
    const stats = [
        {
            title: "TOTAL REVENUE",
            value: "$748,290",
            subtitle: "$64k this month",
            change: 18.2,
            icon: ChartNoAxesCombined,
        },
        {
            title: "TOTAL ORDERS",
            value: "3,284",
            subtitle: "421 this month",
            change: 12.5,
            icon: ShoppingCart,
        },
        {
            title: "ACTIVE USERS",
            value: "6,841",
            subtitle: "43 new this week",
            change: 5.3,
            icon: UsersRound,
        },
        {
            title: "TOTAL PRODUCTS",
            value: "38",
            subtitle: "8 new arrivals",
            change: 3.1,
            icon: Package,
        },
    ]
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
        </div>
    )
}
export default DashboardPage