
"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

type MonthData = {
    month: string;
    revenue: number;
    orders: number;
};

export function AnalyticsRevenueOrders({
    data,
}: {
    data: MonthData[];
}) {
    return (
        <section className="border border-white/15 bg-dark p-4 light:border-black/15 light:bg-white">
            <h2 className="font-mono text-sm font-bold tracking-wider text-white light:text-main">
                REVENUE &amp; ORDERS (12 MONTHS)
            </h2>
            <p className="mt-1 font-mono text-xs text-white/50 light:text-main/50">
                Monthly revenue and order volume
            </p>

            <div className="mt-4 h-70 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid
                            stroke="var(--admin-chart-grid)"
                            strokeOpacity={0.12}
                            strokeDasharray="3 3"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "var(--admin-chart-axis)", fontSize: 10 }}
                        />
                        <YAxis
                            yAxisId="revenue"
                            axisLine={false}
                            tickLine={false}
                            width={48}
                            tick={{ fill: "var(--admin-chart-axis)", fontSize: 10 }}
                            tickFormatter={(value) =>
                                `$${Number(value) >= 1000
                                    ? `${(Number(value) / 1000).toFixed(0)}k`
                                    : value}`
                            }
                        />
                        <YAxis
                            yAxisId="orders"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            width={35}
                            tick={{ fill: "var(--admin-chart-axis)", fontSize: 10 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "var(--admin-chart-tooltip)",
                                border: "1px solid var(--admin-chart-border)",
                                borderRadius: 0,
                                color: "var(--admin-chart-tooltip-text)",
                                fontSize: 12,
                            }}
                            formatter={(value, name) => [
                                name === "Revenue"
                                    ? `$${Number(value).toLocaleString()}`
                                    : Number(value).toLocaleString(),
                                name,
                            ]}
                        />
                        <Legend
                            wrapperStyle={{
                                fontSize: 10,
                                color: "var(--admin-chart-axis)",
                            }}
                        />
                        <Bar
                            yAxisId="revenue"
                            dataKey="revenue"
                            name="Revenue"
                            fill="#c6ff00"
                            maxBarSize={32}
                        />
                        <Bar
                            yAxisId="orders"
                            dataKey="orders"
                            name="Orders"
                            fill="#6366f1"
                            maxBarSize={32}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}
