'use client';
import { RevenuePeriod } from "@/utils/AdminUtils/getRevenueChartData";
import { useState } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

type RevenueData = {
    label: string;
    revenue: number;
};

interface RevenueOverviewProps {
    monthlyData: RevenueData[];
    weeklyData: RevenueData[];
}



export const RevenueOverview = ({ monthlyData, weeklyData }: RevenueOverviewProps) => {

    const [period, setPeriod] = useState<RevenuePeriod>("monthly");

    const data = period === "monthly" ? monthlyData : weeklyData;

    return (
        <section className=" border border-white/10 bg-dark">
            {/* Header */}
            <div className="flex items-start justify-between p-4">

                <div>
                    <h2 className="text-sm font-bold tracking-widest text-white">
                        REVENUE OVERVIEW
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                        Total earnings over time
                    </p>
                </div>

                {/* Period Toggle */}
                <div className="flex items-center border border-white/10">
                    <button
                        type="button"
                        onClick={() => setPeriod("weekly")}
                        className={`px-3 py-2 text-[10px] font-bold tracking-wider transition ${period === "weekly"
                            ? "bg-[#c6ff00] text-black"
                            : "text-gray-500 hover:text-white"
                            }`}
                    >
                        WEEKLY
                    </button>

                    <button
                        type="button"
                        onClick={() => setPeriod("monthly")}
                        className={`px-3 py-2 text-[10px] font-bold tracking-wider transition ${period === "monthly"
                            ? "bg-[#c6ff00] text-black"
                            : "text-gray-500 hover:text-white"
                            }`}
                    >
                        MONTHLY
                    </button>
                </div>
            </div>

            {/* Chart */}
            <div className="mt-4 h-70 w-full px-2 pb-4">
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <AreaChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 10,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient
                                id="revenueGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="#c6ff00"
                                    stopOpacity={0.35}
                                />

                                <stop
                                    offset="100%"
                                    stopColor="#c6ff00"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            stroke="#ffffff"
                            strokeOpacity={0.08}
                            strokeDasharray="3 3"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fill: "#666",
                                fontSize: 10,
                            }}
                        />

                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            width={45}
                            tick={{
                                fill: "#666",
                                fontSize: 10,
                            }}
                            tickFormatter={(value) =>
                                `$${Number(value) / 1000}k`
                            }
                        />

                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#111",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "4px",
                                color: "#fff",
                            }}
                            labelStyle={{
                                color: "#888",
                            }}
                            formatter={(value) => [
                                `$${Number(value).toLocaleString()}`,
                                "Revenue",
                            ]}
                        />

                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#c6ff00"
                            strokeWidth={2}
                            fill="url(#revenueGradient)"
                            dot={false}
                            activeDot={{
                                r: 4,
                                fill: "#c6ff00",
                                stroke: "#111",
                                strokeWidth: 2,
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </section>
    )
}
