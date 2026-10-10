
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getAdminOrders } from "@/utils/AdminUtils/getAdminOrders";
import { OrderStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

async function isAdmin() {
    const session = await getServerSession(authOptions);

    return (
        !!session?.user?.id &&
        session.user.role === "ADMIN"
    );
}

export async function GET(req: Request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);

        const search = searchParams.get("search") ?? "";
        const rawStatus = searchParams.get("status") ?? "";
        const rawPage = Number(searchParams.get("page") ?? "1");

        let status: OrderStatus | undefined;

        if (rawStatus && rawStatus.toLowerCase() !== "all") {
            const normalizedStatus = rawStatus.toUpperCase();

            if (
                !Object.values(OrderStatus).includes(
                    normalizedStatus as OrderStatus
                )
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Invalid order status",
                    },
                    { status: 400 }
                );
            }

            status = normalizedStatus as OrderStatus;
        }

        const data = await getAdminOrders({
            search,
            status,
            page: Number.isFinite(rawPage)
                ? Math.max(1, Math.floor(rawPage))
                : 1,
        });

        return NextResponse.json(
            { success: true, data },
            { status: 200 }
        );
    } catch (error) {
        console.error("GET /api/admin/orders error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch orders",
            },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { id, status: rawStatus } = body;

        if (
            typeof id !== "string" ||
            !id.trim() ||
            typeof rawStatus !== "string"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Order ID and status are required",
                },
                { status: 400 }
            );
        }

        const normalizedStatus = rawStatus.toUpperCase();

        if (
            !Object.values(OrderStatus).includes(
                normalizedStatus as OrderStatus
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid order status",
                },
                { status: 400 }
            );
        }

        const existingOrder = await prisma.order.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!existingOrder) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Order not found",
                },
                { status: 404 }
            );
        }

        const order = await prisma.order.update({
            where: { id },
            data: {
                status: normalizedStatus as OrderStatus,
            },
            select: {
                id: true,
                orderCode: true,
                status: true,
                createdAt: true,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Order status updated successfully",
                data: order,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("PATCH /api/admin/orders error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to update order status",
            },
            { status: 500 }
        );
    }
}
