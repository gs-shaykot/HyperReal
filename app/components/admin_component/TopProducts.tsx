"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface TopProduct {
    id: string;
    name: string;
    sales: number;
}

interface TopProductsProps {
    data: TopProduct[];
}

export const TopProducts = ({
    data,
}: TopProductsProps) => {
    return (
        <section className="w-full border border-white/10 bg-dark p-6 light:border-black/10 light:bg-white">

            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold tracking-widest text-white light:text-zinc-900">
                    TOP PRODUCTS
                </h2>

                <span className="text-lg text-gray-500">
                    ↗
                </span>
            </div>

            {/* Chart */}
            <div className="mt-5 h-67.5 w-full">
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{
                            top: 0,
                            right: 10,
                            left: -45,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid
                            stroke="var(--admin-chart-grid)"
                            strokeOpacity={0.08}
                            strokeDasharray="3 3"
                            horizontal={false}
                        />

                        <XAxis
                            type="number"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fill: "var(--admin-chart-axis)",
                                fontSize: 10,
                            }}
                        />

                        <YAxis
                            type="category"
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            width={120}
                            tick={{
                                fill: "var(--admin-chart-label)",
                                fontSize: 9,
                            }}
                        />

                        <Tooltip
                            cursor={{
                                fill: "var(--admin-chart-cursor)",
                            }}
                            contentStyle={{
                                backgroundColor: "var(--admin-chart-tooltip)",
                                border: "1px solid var(--admin-chart-border)",
                                borderRadius: "4px",
                            }}
                            labelStyle={{
                                color: "var(--admin-chart-tooltip-text)",
                                fontSize: 11,
                                fontWeight: 700,
                            }}
                            formatter={(value) => [
                                `${Number(value).toLocaleString()}`,
                                "Sales",
                            ]}
                        />

                        <Bar
                            dataKey="sales"
                            fill="#c6ff00"
                            radius={0}
                            barSize={16}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
};