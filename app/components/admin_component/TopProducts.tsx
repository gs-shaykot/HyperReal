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
        <section className="w-full border border-white/10 bg-dark p-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold tracking-widest text-white">
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
                            stroke="#ffffff"
                            strokeOpacity={0.08}
                            strokeDasharray="3 3"
                            horizontal={false}
                        />

                        <XAxis
                            type="number"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fill: "#666",
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
                                fill: "#888",
                                fontSize: 9,
                            }}
                        />

                        <Tooltip
                            cursor={{
                                fill: "rgba(255,255,255,0.03)",
                            }}
                            contentStyle={{
                                backgroundColor: "#111",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "4px",
                            }}
                            labelStyle={{
                                color: "#fff",
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