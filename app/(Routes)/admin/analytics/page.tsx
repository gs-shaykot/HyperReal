
import {
    Activity,
    ChartNoAxesCombined,
    ShoppingCart,
    Tags,
    UsersRound,
} from "lucide-react";

import { getAnalyticsData } from "@/utils/AdminUtils/getAnalyticsData";
import { AnalyticsRevenueOrders } from "@/app/components/admin_component/analytics/AnalyticsRevenueOrders";
import { AnalyticsUserGrowth } from "@/app/components/admin_component/analytics/AnalyticsUserGrowth";
import { AnalyticsConversionRate } from "@/app/components/admin_component/analytics/AnalyticsConversionRate";

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
}

function formatPercent(value: number | null) {
    if (value === null) return "N/A";
    return `${value > 0 ? "+" : ""}${value}%`;
}

const AnalyticsPage = async () => {
    const analytics = await getAnalyticsData();

    const stats = [
        {
            title: "ANNUAL REVENUE",
            value: formatCurrency(analytics.currentYearRevenue),
            subtitle: `${formatPercent(analytics.annualGrowth)} YoY`,
            icon: ChartNoAxesCombined,
        },
        {
            title: "AVG. ORDER VALUE",
            value: formatCurrency(analytics.avgOrderValue),
            subtitle: `${analytics.totalPaidOrders.toLocaleString()} paid orders in 12 months`,
            icon: ShoppingCart,
        },
        {
            title: "TOP CATEGORY",
            value: analytics.topCategory?.name ?? "No sales yet",
            subtitle: analytics.topCategory
                ? `${analytics.topCategory.share.toFixed(1)}% of revenue`
                : "Category sales will appear here",
            icon: Tags,
        },
        {
            title: "REGISTERED CUSTOMERS",
            value: analytics.totalCustomers.toLocaleString(),
            subtitle: `${analytics.totalOrders.toLocaleString()} orders all time`,
            icon: UsersRound,
        },
    ];

    return (
        <main className="min-h-screen bg-main p-4 light:bg-white ">
            <header className="mb-5">
                <div className="flex items-center gap-2">
                    <Activity className="size-4 text-second" />
                    <h1 className="font-mono text-xl font-bold tracking-wider text-white light:text-main">
                        ANALYTICS
                    </h1>
                </div>

                <p className="mt-1 font-mono text-xs text-white/50 light:text-main/50">
                    Full-year performance overview
                </p>
            </header>

            {/* KPI CARDS */}
            <section
                aria-label="Analytics summary"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <article
                            key={stat.title}
                            className="min-w-0 border border-white/15 bg-dark p-4 light:border-black/15 light:bg-white"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <h2 className="font-mono text-[10px] font-bold tracking-[0.15em] text-white/60 light:text-main/60">
                                    {stat.title}
                                </h2>

                                <Icon className="size-4 shrink-0 text-second" />
                            </div>

                            <p className="mt-3 truncate font-mono text-2xl font-bold text-white light:text-main">
                                {stat.value}
                            </p>

                            <p className="mt-2 font-mono text-[10px] text-second">
                                {stat.subtitle}
                            </p>
                        </article>
                    );
                })}
            </section>

            {/* REVENUE & ORDERS */}
            <div className="mt-4">
                <AnalyticsRevenueOrders data={analytics.months} />
            </div>

            {/* USER GROWTH & ORDER RATE */}
            <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
                <AnalyticsUserGrowth data={analytics.months} />
                <AnalyticsConversionRate data={analytics.months} />
            </section>
        </main>
    );
};

export default AnalyticsPage;
