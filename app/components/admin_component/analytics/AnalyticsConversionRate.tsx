
"use client";

import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

type MonthData = {
    month: string;
    orderRate: number;
};

export function AnalyticsConversionRate({
    data,
}: {
    data: MonthData[];
}) {
    return (
        <section className="min-w-0 border border-white/15 bg-dark p-4 light:border-black/15 light:bg-white">
            <h2 className="font-mono text-sm font-bold tracking-wider text-white light:text-main">
                ORDER RATE
            </h2>
            <p className="mt-1 font-mono text-xs text-white/50 light:text-main/50">
                Monthly orders relative to registered customers
            </p>

            <div className="mt-4 h-62.5 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
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
                            axisLine={false}
                            tickLine={false}
                            width={42}
                            tick={{ fill: "var(--admin-chart-axis)", fontSize: 10 }}
                            tickFormatter={(value) => `${value}%`}
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
                                `${Number(value).toFixed(2)}%`,
                                "Orders / customers",
                            ]}
                        />
                        <Line
                            type="monotone"
                            dataKey="orderRate"
                            name="Order rate"
                            stroke="#c6ff00"
                            strokeWidth={2}
                            dot={{
                                r: 2.5,
                                fill: "#c6ff00",
                                strokeWidth: 0,
                            }}
                            activeDot={{
                                r: 5,
                                fill: "#c6ff00",
                                stroke: "var(--admin-chart-tooltip)",
                                strokeWidth: 2,
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}
