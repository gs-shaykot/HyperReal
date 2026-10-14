
"use client";

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

type MonthData = {
    month: string;
    cumulativeUsers: number;
};

export function AnalyticsUserGrowth({
    data,
}: {
    data: MonthData[];
}) {
    return (
        <section className="min-w-0 border border-white/15 bg-dark p-4 light:border-black/15 light:bg-white">
            <h2 className="font-mono text-sm font-bold tracking-wider text-white light:text-main">
                USER GROWTH
            </h2>
            <p className="mt-1 font-mono text-xs text-white/50 light:text-main/50">
                Cumulative registered customers
            </p>

            <div className="mt-4 h-62.5 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient
                                id="analyticsUserGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="#6366f1"
                                    stopOpacity={0.3}
                                />
                                <stop
                                    offset="100%"
                                    stopColor="#6366f1"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>

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
                            axisLine={false}
                            tickLine={false}
                            width={45}
                            tick={{ fill: "var(--admin-chart-axis)", fontSize: 10 }}
                            tickFormatter={(value) =>
                                Number(value) >= 1000
                                    ? `${(Number(value) / 1000).toFixed(1)}k`
                                    : String(value)
                            }
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "var(--admin-chart-tooltip)",
                                border: "1px solid var(--admin-chart-border)",
                                borderRadius: 0,
                                color: "var(--admin-chart-tooltip-text)",
                                fontSize: 12,
                            }}
                            formatter={(value) => [
                                Number(value).toLocaleString(),
                                "Registered users",
                            ]}
                        />
                        <Area
                            type="monotone"
                            dataKey="cumulativeUsers"
                            name="Registered users"
                            stroke="#6366f1"
                            strokeWidth={2}
                            fill="url(#analyticsUserGradient)"
                            activeDot={{ r: 4, fill: "#6366f1" }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}
