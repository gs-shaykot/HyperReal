
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
    CalendarDays,
    Check,
    LoaderCircle,
    Plus,
    Tag,
    Trash2,
    X,
} from "lucide-react";
import { FormEvent, useState } from "react";

type Coupon = {
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

type CouponForm = {
    code: string;
    value: string;
    minSpend: string;
    limit: string;
    expiryDate: string;
    type: "percent" | "flat";
    maxDiscount: string;
    newUserOnly: boolean;
};

const initialForm: CouponForm = {
    code: "",
    value: "20",
    minSpend: "0",
    limit: "100",
    expiryDate: "",
    type: "percent",
    maxDiscount: "",
    newUserOnly: false,
};

function isExpired(coupon: Coupon) {
    return Boolean(
        coupon.expiryDate && new Date(coupon.expiryDate) < new Date()
    );
}

function isExhausted(coupon: Coupon) {
    return coupon.limit !== null && coupon.usedCount >= coupon.limit;
}

function isActive(coupon: Coupon) {
    return !isExpired(coupon) && !isExhausted(coupon);
}

function formatDate(date: string | null) {
    if (!date) return "No expiry";
    return new Date(date).toLocaleDateString("en-CA");
}

export function AdminCoupons() {
    const queryClient = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState<CouponForm>(initialForm);
    const [error, setError] = useState("");

    const {
        data: coupons = [],
        isLoading,
        isError,
    } = useQuery<Coupon[]>({
        queryKey: ["admin-coupons"],
        queryFn: async () => {
            const response = await axios.get("/api/admin/coupons");
            return response.data.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (payload: CouponForm) => {
            const response = await axios.post("/api/admin/coupons", {
                ...payload,
                value: Number(payload.value),
                minSpend: Number(payload.minSpend),
                limit: payload.limit === "" ? null : Number(payload.limit),
                maxDiscount:
                    payload.type === "percent" && payload.maxDiscount !== ""
                        ? Number(payload.maxDiscount)
                        : null,
                expiryDate: payload.expiryDate || null,
            });

            return response.data.data as Coupon;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["admin-coupons"],
            });
            await queryClient.invalidateQueries({
                queryKey: ["coupons"],
            });

            setModalOpen(false);
            setForm(initialForm);
            setError("");
        },
        onError: (err) => {
            if (axios.isAxiosError(err)) {
                setError(
                    err.response?.data?.message ?? "Could not create coupon."
                );
            } else {
                setError("Could not create coupon.");
            }
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await axios.delete(`/api/admin/coupons?id=${encodeURIComponent(id)}`);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["admin-coupons"],
            });
            await queryClient.invalidateQueries({
                queryKey: ["coupons"],
            });
        },
    });

    const activeCoupons = coupons.filter(isActive).length;
    const expiredCoupons = coupons.filter(isExpired).length;
    const totalUsed = coupons.reduce(
        (total, coupon) => total + coupon.usedCount,
        0
    );

    const percentageCoupons = coupons.filter(
        (coupon) => coupon.type.toLowerCase() === "percent"
    );

    const averageDiscount = percentageCoupons.length
        ? Math.round(
              percentageCoupons.reduce(
                  (total, coupon) => total + coupon.value,
                  0
              ) / percentageCoupons.length
          )
        : 0;

    const updateForm = <K extends keyof CouponForm>(
        key: K,
        value: CouponForm[K]
    ) => {
        setForm((current) => ({ ...current, [key]: value }));
    };

    const handleCreate = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        createMutation.mutate(form);
    };

    return (
        <div className="min-h-screen bg-main p-4 light:bg-white">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-lg font-bold tracking-[0.08em] text-white light:text-zinc-900">
                        COUPONS & DISCOUNTS
                    </h1>
                    <p className="mt-1 font-mono text-xs text-zinc-500">
                        {activeCoupons} active coupons
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setError("");
                        setModalOpen(true);
                    }}
                    className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-2 bg-second px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-black hover:opacity-90"
                >
                    <Plus className="size-3.5" />
                    CREATE COUPON
                </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                            className={`mt-2 text-xl font-bold ${
                                stat.accent
                                    ? "text-second"
                                    : "text-white light:text-zinc-900"
                            }`}
                        >
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

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

                {!isLoading && !isError && coupons.length === 0 && (
                    <div className="border border-zinc-800 p-10 text-center light:border-zinc-200">
                        <Tag className="mx-auto size-6 text-zinc-500" />
                        <p className="mt-3 font-mono text-xs text-zinc-400">
                            NO COUPONS YET
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                            Create your first coupon to get started.
                        </p>
                    </div>
                )}

                {coupons.map((coupon) => {
                    const active = isActive(coupon);
                    const exhausted = isExhausted(coupon);
                    const usagePercent =
                        coupon.limit && coupon.limit > 0
                            ? Math.min(
                                  100,
                                  (coupon.usedCount / coupon.limit) * 100
                              )
                            : 0;

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
                                            className={`border px-2 py-0.5 font-mono text-[9px] font-bold ${
                                                active
                                                    ? "border-second/40 bg-second/10 text-second"
                                                    : "border-zinc-700 text-zinc-500"
                                            }`}
                                        >
                                            {active ? "ACTIVE" : exhausted ? "USED UP" : "EXPIRED"}
                                        </span>

                                        <span className="border border-blue-500/40 bg-blue-500/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-blue-400">
                                            {coupon.type === "percent"
                                                ? "PERCENTAGE"
                                                : "FIXED"}
                                        </span>
                                    </div>

                                    <p className="mt-2 wrap-break-word font-mono text-[10px] leading-relaxed text-zinc-400">
                                        {coupon.type === "percent"
                                            ? `${coupon.value}% off`
                                            : `$${coupon.value} off`}
                                        {" · Min order: $"}
                                        {coupon.minSpend}
                                        {" · Expires: "}
                                        {formatDate(coupon.expiryDate)}
                                        {coupon.newUserOnly ? " · New users only" : ""}
                                    </p>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center justify-between gap-6 sm:justify-end">
                                <div className="w-20">
                                    <p className="text-right font-mono text-[9px] tracking-widest text-zinc-500">
                                        USED
                                    </p>
                                    <p className="text-right font-mono text-xs font-bold text-white light:text-zinc-900">
                                        {coupon.usedCount}/
                                        {coupon.limit ?? "∞"}
                                    </p>

                                    {coupon.limit !== null && (
                                        <div className="mt-1 h-1 w-full bg-zinc-800">
                                            <div
                                                className="h-full bg-second"
                                                style={{
                                                    width: `${usagePercent}%`,
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    title="Delete coupon"
                                    disabled={deleteMutation.isPending}
                                    onClick={() => {
                                        if (
                                            window.confirm(
                                                `Delete coupon ${coupon.code}? This cannot be undone.`
                                            )
                                        ) {
                                            deleteMutation.mutate(coupon.id);
                                        }
                                    }}
                                    className="cursor-pointer p-2 text-zinc-500 transition-colors hover:text-red-400 disabled:opacity-40"
                                >
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {deleteMutation.isError && (
                <p className="mt-3 font-mono text-xs text-red-400">
                    Failed to delete coupon. Please try again.
                </p>
            )}

            {modalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setModalOpen(false);
                        }
                    }}
                >
                    <div className="my-auto w-full max-w-md border border-zinc-800 bg-[#101010] light:border-zinc-200 light:bg-white">
                        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4 light:border-zinc-200">
                            <h2 className="font-mono text-xs font-bold tracking-widest text-white light:text-zinc-900">
                                CREATE COUPON
                            </h2>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="cursor-pointer text-zinc-400 hover:text-white light:hover:text-black"
                                aria-label="Close create coupon modal"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4 p-5">
                            <div>
                                <label className="mb-1.5 block font-mono text-[10px] tracking-widest text-zinc-400">
                                    COUPON CODE *
                                </label>
                                <input
                                    required
                                    minLength={3}
                                    maxLength={30}
                                    value={form.code}
                                    onChange={(event) =>
                                        updateForm(
                                            "code",
                                            event.target.value.toUpperCase()
                                        )
                                    }
                                    placeholder="e.g. SUMMER20"
                                    className="h-10 w-full border border-zinc-800 bg-black px-3 font-mono text-xs text-white outline-none focus:border-second light:border-zinc-300 light:bg-white light:text-zinc-900"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block font-mono text-[10px] tracking-widest text-zinc-400">
                                    DISCOUNT VALUE *
                                </label>
                                <input
                                    required
                                    type="number"
                                    min="0.01"
                                    max={form.type === "percent" ? 100 : undefined}
                                    step="0.01"
                                    value={form.value}
                                    onChange={(event) =>
                                        updateForm("value", event.target.value)
                                    }
                                    className="h-10 w-full border border-zinc-800 bg-black px-3 font-mono text-xs text-white outline-none focus:border-second light:border-zinc-300 light:bg-white light:text-zinc-900"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block font-mono text-[10px] tracking-widest text-zinc-400">
                                    MIN. ORDER ($)
                                </label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.minSpend}
                                    onChange={(event) =>
                                        updateForm("minSpend", event.target.value)
                                    }
                                    className="h-10 w-full border border-zinc-800 bg-black px-3 font-mono text-xs text-white outline-none focus:border-second light:border-zinc-300 light:bg-white light:text-zinc-900"
                                />
                            </div>

                            {form.type === "percent" && (
                                <div>
                                    <label className="mb-1.5 block font-mono text-[10px] tracking-widest text-zinc-400">
                                        MAX. DISCOUNT ($) — OPTIONAL
                                    </label>
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={form.maxDiscount}
                                        onChange={(event) =>
                                            updateForm(
                                                "maxDiscount",
                                                event.target.value
                                            )
                                        }
                                        placeholder="No maximum"
                                        className="h-10 w-full border border-zinc-800 bg-black px-3 font-mono text-xs text-white outline-none focus:border-second light:border-zinc-300 light:bg-white light:text-zinc-900"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="mb-1.5 block font-mono text-[10px] tracking-widest text-zinc-400">
                                    USAGE LIMIT — LEAVE EMPTY FOR UNLIMITED
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={form.limit}
                                    onChange={(event) =>
                                        updateForm("limit", event.target.value)
                                    }
                                    className="h-10 w-full border border-zinc-800 bg-black px-3 font-mono text-xs text-white outline-none focus:border-second light:border-zinc-300 light:bg-white light:text-zinc-900"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block font-mono text-[10px] tracking-widest text-zinc-400">
                                    EXPIRES AT — OPTIONAL
                                </label>
                                <div className="relative">
                                    <CalendarDays className="pointer-events-none absolute right-3 top-3 size-4 text-zinc-500" />
                                    <input
                                        type="date"
                                        min={new Date().toLocaleDateString("en-CA")}
                                        value={form.expiryDate}
                                        onChange={(event) =>
                                            updateForm(
                                                "expiryDate",
                                                event.target.value
                                            )
                                        }
                                        className="h-10 w-full border border-zinc-800 bg-black px-3 pr-10 font-mono text-xs text-white outline-none focus:border-second light:border-zinc-300 light:bg-white light:text-zinc-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block font-mono text-[10px] tracking-widest text-zinc-400">
                                    DISCOUNT TYPE
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {([
                                        ["percent", "% PERCENT"],
                                        ["flat", "$ FIXED"],
                                    ] as const).map(([type, label]) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() =>
                                                updateForm("type", type)
                                            }
                                            className={`h-9 cursor-pointer border font-mono text-[10px] font-bold tracking-widest ${
                                                form.type === type
                                                    ? "border-second bg-second text-black"
                                                    : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <label className="flex cursor-pointer items-center gap-2 font-mono text-[10px] text-zinc-400">
                                <input
                                    type="checkbox"
                                    checked={form.newUserOnly}
                                    onChange={(event) =>
                                        updateForm(
                                            "newUserOnly",
                                            event.target.checked
                                        )
                                    }
                                    className="accent-lime-400"
                                />
                                NEW USERS ONLY
                            </label>

                            {error && (
                                <p role="alert" className="text-xs text-red-400">
                                    {error}
                                </p>
                            )}

                            <div className="flex gap-3 pt-1">
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="inline-flex h-9 flex-1 items-center justify-center gap-2 bg-second font-mono text-[10px] font-bold tracking-widest text-black hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {createMutation.isPending ? (
                                        <LoaderCircle className="size-4 animate-spin" />
                                    ) : (
                                        <Check className="size-4" />
                                    )}
                                    CREATE COUPON
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="h-9 border border-zinc-800 px-5 font-mono text-[10px] font-bold tracking-widest text-white hover:bg-zinc-900 light:text-zinc-900"
                                >
                                    CANCEL
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
