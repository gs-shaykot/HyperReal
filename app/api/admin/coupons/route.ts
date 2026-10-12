
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CouponType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

async function isAdmin() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) return false;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, isBlocked: true },
    });

    return user?.role === "ADMIN" && !user.isBlocked;
}

export async function GET() {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const coupons = await prisma.coupon.findMany({
            orderBy: { expiryDate: "desc" },
        });

        return NextResponse.json({ success: true, data: coupons });
    } catch {
        return NextResponse.json(
            { success: false, message: "Failed to fetch coupons" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();

        const code =
            typeof body.code === "string"
                ? body.code.trim().toUpperCase()
                : "";

        const type = body.type;
        const value = Number(body.value);
        const minSpend = Number(body.minSpend);
        const limit =
            body.limit === "" || body.limit == null
                ? null
                : Number(body.limit);
        const expiryDate =
            body.expiryDate ? new Date(body.expiryDate) : null;

        if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
            return NextResponse.json(
                { success: false, message: "Enter a valid coupon code (3–30 letters, numbers, _ or -)." },
                { status: 400 }
            );
        }

        if (!Object.values(CouponType).includes(type)) {
            return NextResponse.json(
                { success: false, message: "Invalid discount type." },
                { status: 400 }
            );
        }

        if (
            !Number.isFinite(value) ||
            value <= 0 ||
            (type === CouponType.percent && value > 100) ||
            !Number.isFinite(minSpend) ||
            minSpend < 0
        ) {
            return NextResponse.json(
                { success: false, message: "Check the discount value and minimum order." },
                { status: 400 }
            );
        }

        if (
            limit !== null &&
            (!Number.isInteger(limit) || limit < 1)
        ) {
            return NextResponse.json(
                { success: false, message: "Usage limit must be a positive whole number." },
                { status: 400 }
            );
        }

        if (
            expiryDate &&
            (!Number.isFinite(expiryDate.getTime()) ||
                expiryDate <= new Date())
        ) {
            return NextResponse.json(
                { success: false, message: "Expiry date must be in the future." },
                { status: 400 }
            );
        }

        const maxDiscount =
            type === CouponType.percent && body.maxDiscount !== ""
                && body.maxDiscount != null
                ? Number(body.maxDiscount)
                : null;

        if (
            maxDiscount !== null &&
            (!Number.isFinite(maxDiscount) || maxDiscount <= 0)
        ) {
            return NextResponse.json(
                { success: false, message: "Maximum discount must be greater than zero." },
                { status: 400 }
            );
        }

        const coupon = await prisma.coupon.create({
            data: {
                code,
                type,
                value,
                minSpend,
                maxDiscount,
                newUserOnly: Boolean(body.newUserOnly),
                limit,
                expiryDate,
            },
        });

        return NextResponse.json(
            { success: true, data: coupon },
            { status: 201 }
        );
    } catch (error: unknown) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                { success: false, message: "That coupon code already exists." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to create coupon." },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Coupon ID is required." },
                { status: 400 }
            );
        }

        await prisma.coupon.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { success: false, message: "Failed to delete coupon." },
            { status: 500 }
        );
    }
}
