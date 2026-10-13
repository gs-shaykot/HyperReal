
"use client";
import { AddCouponModal } from "@/app/components/admin_component/coupons/AddCouponModal";
import { useCreateCoupon, useDeleteCoupon } from "@/app/Hooks/useCreateCoupon";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
    LoaderCircle,
    Plus,
    Tag,
    Trash2,
} from "lucide-react";
import { ChangeEvent, useState } from "react";


type filterCoupons = {
    search: string;
    status: "all" | "active" | "expired";
    type: "all" | "percent" | "fixed";
    sort: "expiringSoon" | "mostUsed" | "biggestDiscount" | "codeAZ";
}

export type Coupon = {
    id: string;
    code: string;
    type: string;
    value: number;
    minSpend: number;
    maxDiscount: number | null;
    newUserOnly: boolean | null;
    limit: number | null;
    usedCount: number;
    expiryDate: string | null;
};

function isExepired(coupon: Coupon) {
    return Boolean(
        coupon.expiryDate && new Date(coupon.expiryDate) < new Date()
    );
}

function HaveLimit(coupon: Coupon) {
    return coupon.limit !== null && coupon.usedCount >= coupon.limit;
}

function isActive(coupon: Coupon) {
    return !isExepired(coupon) && !HaveLimit(coupon);
}

export function AdminCoupons() {
    const [filterData, setFilterData] = useState<filterCoupons>({
        search: "",
        status: "all",
        type: "all",
        sort: "expiringSoon",
    });

    const [open, setOpen] = useState(false);

    const { data: AllCoupons, isLoading, isError } = useQuery<Coupon[]>({
        queryKey: ["admin-coupons"],
        queryFn: async () => {
            const res = await axios.get("/api/admin/coupons");
            return res.data.data;
        }
    })

    const coupons = AllCoupons ?? [];

    const createMutation = useCreateCoupon({
        onCreated: () => {
            setOpen(false);
        },
        onErrorMessage: (message) => {
            console.error(message);
        },
    });

    const deleteMutation = useDeleteCoupon();

    const filteredCoupons = coupons
        .filter((coupon) =>
            coupon.code.toLowerCase().includes(filterData.search.toLowerCase().trim())
        )
        .filter((coupon) => {
            if (filterData.status === 'active') return isActive(coupon);
            if (filterData.status === 'expired') return isExepired(coupon);
            return true;
        })
        .filter((coupon) => {
            if (filterData.type === 'all') return true;
            return coupon.type.toLowerCase() === filterData.type.toLowerCase();
        })
        .sort((a, b) => {
            switch (filterData.sort) {
                case "mostUsed":
                    return b.usedCount - a.usedCount;

                case "expiringSoon": {
                    if (!a.expiryDate) return 1;
                    if (!b.expiryDate) return -1;

                    return (
                        new Date(a.expiryDate).getTime() -
                        new Date(b.expiryDate).getTime()
                    );
                }
                case "biggestDiscount":
                    return b.value - a.value;

                case "codeAZ":
                    return a.code.localeCompare(b.code);

                default:
                    return 0;
            }
        })

    const activeCoupons = coupons.filter((coupon) => isActive(coupon)).length;
    const expiredCoupons = coupons.filter(coupon => isExepired(coupon)).length;
    const totalUsed = coupons.reduce((total, coupon) => total + coupon.usedCount, 0);
    const percentageCoupons = coupons.filter((coupon) => coupon.type.toLowerCase() === "percent");
    const averageDiscount = percentageCoupons.length ? Math.round(
        percentageCoupons.reduce(
            (total, coupon) => total + coupon.value,
            0
        ) / percentageCoupons.length
    ) : 0;

    return (
        <div className="min-h-screen bg-main p-4 light:bg-white">
            {/* HEADER */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-lg font-bold tracking-[0.08em] text-white light:text-zinc-900">
                        COUPONS & DISCOUNTS
                    </h1>

                    <p className="mt-1 font-mono text-xs text-zinc-500">
                        5 shown · 4 active coupons
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="inline-flex h-8 shrink-0 items-center gap-2 bg-second px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-black cursor-pointer"
                >
                    <Plus className="size-3.5" />
                    CREATE COUPON
                </button>
            </div>

            {/* SEARCH AND FILTERS */}
            <div className="mt-6 space-y-4 border border-zinc-800 p-3 light:border-zinc-200">
                <div className="flex flex-col gap-3 lg:flex-row">
                    <input
                        type="text"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFilterData((prev) => ({ ...prev, search: e.target.value }))}
                        placeholder="Search by coupon code..."
                        className="h-10 min-w-0 flex-1 border border-zinc-800 bg-[#101010] px-3 font-mono text-xs text-white outline-none light:border-zinc-300 light:bg-white light:text-zinc-900"
                    />

                    <select
                        defaultValue="expiringSoon"
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterData((prev) => ({ ...prev, sort: e.target.value as filterCoupons["sort"] }))}
                        className="h-10 border border-zinc-800 bg-[#101010] px-3 font-mono text-xs text-white light:border-zinc-300 light:bg-white light:text-zinc-900"
                    >
                        <option value="expiringSoon">SORT: EXPIRING SOON</option>
                        <option value="mostUsed">SORT: MOST USED</option>
                        <option value="biggestDiscount">SORT: BIGGEST DISCOUNT</option>
                        <option value="codeAZ">SORT: CODE A–Z</option>
                    </select>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="mr-1 font-mono text-[10px] tracking-widest text-zinc-400">
                        STATUS
                    </span>

                    {["ALL", "ACTIVE", "EXPIRED"].map((label, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setFilterData((prev) => ({ ...prev, status: label.toLowerCase() as filterCoupons["status"] }))}
                            className={`h-8 border px-3 font-mono text-[10px] cursor-pointer ${label === filterData.status.toUpperCase()
                                ? "border-second bg-second text-black" : "border-zinc-800 text-zinc-400"}`}
                        >
                            {label}
                        </button>
                    ))}

                    <span className="ml-3 mr-1 font-mono text-[10px] tracking-widest text-zinc-400">
                        TYPE
                    </span>

                    {([
                        ["all", "ALL"],
                        ["percent", "% PERCENT"],
                        ["flat", "$ FIXED"],
                    ] as const).map(([value, label]) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setFilterData((prev) => ({ ...prev, type: value as filterCoupons["type"] }))}
                            className={`h-8 border px-3 font-mono text-[10px] cursor-pointer ${value === filterData.type.toLowerCase()
                                ? "border-second bg-second text-black" : "border-zinc-800 text-zinc-400"}`}
                        >
                            {label}
                        </button>

                    ))}

                    {(
                        filterData.search.trim() !== "" ||
                        filterData.status !== "all" ||
                        filterData.type !== "all" ||
                        filterData.sort !== "expiringSoon"
                    ) && (
                            <button
                                type="button"
                                onClick={() =>
                                    setFilterData({
                                        search: "",
                                        status: "all",
                                        type: "all",
                                        sort: "expiringSoon",
                                    })
                                }
                                className="h-8 border border-red-500 px-3 font-mono text-[10px] text-[#ef4444] transition-all hover:bg-red-500/10 cursor-pointer"
                            >
                                Reset
                            </button>
                        )}
                </div>

                <p className="font-mono text-[10px] text-zinc-400">
                    {filteredCoupons.length} shown · {activeCoupons} active coupons
                </p>
            </div>

            {/* STATISTICS */}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    { label: "ACTIVE", value: activeCoupons, accent: true },
                    { label: "EXPIRED", value: expiredCoupons },
                    { label: "TOTAL USED", value: totalUsed },
                    { label: "AVG. DISCOUNT", value: `${averageDiscount}%` },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="border border-zinc-800 bg-[#101010] p-4 light:border-zinc-200 light:bg-white"
                    >
                        <p className="font-mono text-[10px] tracking-[0.14em] text-zinc-400">
                            {stat.label}
                        </p>

                        <p
                            className={`mt-2 text-xl font-bold ${stat.accent
                                ? "text-second"
                                : "text-white light:text-zinc-900"
                                }`}
                        >
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* COUPON LIST */}
            <div className="mt-5 space-y-3">
                {isLoading && (
                    <div className="flex items-center gap-2 border border-zinc-800 p-6 font-mono text-xs text-zinc-400">
                        <LoaderCircle className="size-4 animate-spin" />
                        LOADING COUPONS...
                    </div>
                )}

                {isError && (
                    <div className="border border-red-500/30 p-4 font-mono text-xs text-red-400">
                        Could not load coupons. Check the admin API and try refreshing.
                    </div>
                )}

                {!isLoading && !isError && filteredCoupons.length === 0 && (
                    <div className="border border-zinc-800 p-10 text-center light:border-zinc-200">
                        <p className="mt-3 font-mono text-xs text-zinc-400">
                            {coupons.length === 0
                                ? "NO COUPONS YET"
                                : "NO MATCHING COUPONS"}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                            {coupons.length === 0
                                ? "Create your first coupon to get started."
                                : "Try changing your search or filters."}
                        </p>
                    </div>
                )}
                {filteredCoupons.map((coupon, index) => {
                    const expired = isExepired(coupon);
                    const exhausted = HaveLimit(coupon)
                    
                    return (
                        <div
                            key={coupon.id}
                            className="flex flex-col gap-4 border border-zinc-800 bg-[#101010] p-4 sm:flex-row sm:items-center sm:justify-between light:border-zinc-200 light:bg-white"
                        >
                            <div className="flex min-w-0 items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center bg-second/10 text-second">
                                    <Tag className="size-4" />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="font-mono text-sm font-bold tracking-wider text-white light:text-zinc-900">
                                            {coupon.code}
                                        </h2>

                                        <span
                                            className={`border px-2 py-0.5 font-mono text-[9px] font-bold ${!expired && !exhausted
                                                ? "border-second/40 bg-second/10 text-second"
                                                : "border-zinc-700 text-zinc-500"
                                                }`}
                                        >
                                            {expired ? "EXPIRED" : exhausted ? "USED UP" : "ACTIVE"}
                                        </span>

                                        <span className="border border-blue-500/40 bg-blue-500/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-blue-400">
                                            {coupon.type === "percent"
                                                ? "PERCENTAGE"
                                                : "FIXED"}
                                        </span>
                                    </div>

                                    <p className="mt-2 font-mono text-[10px] leading-relaxed text-zinc-400">
                                        {coupon.type === "percent"
                                            ? `${coupon.value}% off`
                                            : `$${coupon.value} off`}
                                        {" · Min order: $"}
                                        {coupon.minSpend}
                                        {" · Expires: "}
                                        {coupon.expiryDate}
                                        {coupon.newUserOnly
                                            ? " · New users only"
                                            : ""}
                                    </p>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center justify-between gap-6 sm:justify-end">
                                <div className="w-20">
                                    <p className="text-right font-mono text-[9px] tracking-widest text-zinc-500">
                                        USED
                                    </p>

                                    <p className="text-right font-mono text-xs font-bold text-white light:text-zinc-900">
                                        {coupon.usedCount}/{coupon.limit}
                                    </p>

                                    <div className="mt-1 h-1 w-full bg-zinc-800">
                                        <div
                                            className="h-full bg-second"
                                            style={{
                                                width: coupon.limit !== null
                                                    ? `${Math.min((coupon.usedCount / coupon.limit) * 100, 100)}%`
                                                    : "0%",
                                            }}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    title="Delete coupon"
                                    onClick={() => deleteMutation.mutate(coupon.id)}
                                    disabled={deleteMutation.isPending}
                                    className="p-2 text-zinc-500 hover:text-red-400 cursor-pointer"
                                >
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* CREATE COUPON MODAL UI — STATIC */}
            <AddCouponModal
                open={open}
                onCloseAction={() => setOpen(false)}
                onCreate={(form) => createMutation.mutate(form)}
                isPending={createMutation.isPending} />
        </div>
    );
}
