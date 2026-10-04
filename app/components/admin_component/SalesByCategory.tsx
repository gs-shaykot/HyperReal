"use client";

import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

import type { SalesByCategory as SalesByCategoryType } from "@/utils/AdminUtils/getSalesByCategory";

interface SalesByCategoryProps {
    data: SalesByCategoryType[];
}

const CATEGORY_COLORS = [
    "#b6ff00",
    "#6366f1",
    "#f59e0b",
    "#ec4899",
    "#06b6d4",
    "#10b981",
    "#8b5cf6",
    "#ef4444",
];

export const SalesByCategory = ({
    data,
}: SalesByCategoryProps) => {
    return (
        <section className="w-full border border-white/10 bg-main p-4 light:border-black/10 light:bg-white">
            {/* Header */}
            <div>
                <h2 className="text-sm font-bold tracking-widest text-white light:text-zinc-900">
                    SALES BY CATEGORY
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                    Revenue distribution
                </p>
            </div>

            {/* Donut */}
            <div className="mt-6 h-45 w-full">
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="revenue"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={78}
                            paddingAngle={1}
                            stroke="var(--admin-chart-tooltip)"
                            strokeWidth={2}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${entry.name}`}
                                    fill={
                                        CATEGORY_COLORS[
                                            index %
                                                CATEGORY_COLORS.length
                                        ]
                                    }
                                />
                            ))}
                        </Pie>

                        <Tooltip
                            formatter={(
                                value,
                                _name,
                                item
                            ) => {
                                const payload =
                                    item.payload as SalesByCategoryType;

                                return [
                                    `${payload.percentage}%`,
                                    payload.name,
                                ];
                            }}
                            contentStyle={{
                                backgroundColor: "var(--admin-chart-tooltip)",
                                border: "1px solid var(--admin-chart-border)",
                                borderRadius: "4px",
                            }}
                            labelStyle={{
                                color: "var(--admin-chart-tooltip-label)",
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="mt-5 space-y-3">
                {data.map((category, index) => (
                    <div
                        key={category.name}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <span
                                className="h-2.5 w-2.5"
                                style={{
                                    backgroundColor:
                                        CATEGORY_COLORS[
                                            index %
                                                CATEGORY_COLORS.length
                                        ],
                                }}
                            />

                            <span className="text-xs text-gray-400">
                                {category.name}
                            </span>
                        </div>

                        <span className="text-xs font-bold text-white light:text-zinc-900">
                            {category.percentage}%
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
};