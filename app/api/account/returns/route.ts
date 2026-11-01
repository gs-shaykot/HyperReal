import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createReturnRequest, ReturnError } from "@/lib/service/returnService";
import { ReturnReason } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

async function getCustomerId() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.sessionRevoked) return null;
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, isBlocked: true },
    });
    return user && !user.isBlocked ? user.id : null;
}

export async function GET() {
    try {
        const userId = await getCustomerId();
        if (!userId) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

        const returns = await prisma.returnRequest.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
                items: {
                    include: {
                        orderItem: {
                            select: {
                                quantity: true,
                                priceAtPurchase: true,
                                variant: { select: { size: true, color: true, product: { select: { name: true } } } },
                            },
                        },
                    },
                },
                events: { orderBy: { createdAt: "asc" } },
                refund: true,
                order: { select: { orderCode: true, shipment: { select: { deliveredAt: true } } } },
            },
        });
        return NextResponse.json({ success: true, data: returns });
    } catch {
        return NextResponse.json({ success: false, message: "Could not load return requests." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const userId = await getCustomerId();
        if (!userId) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

        const body = await request.json().catch(() => null) as {
            orderId?: unknown;
            reason?: unknown;
            customerNote?: unknown;
            items?: unknown;
        } | null;

        if (!body || typeof body.orderId !== "string" || typeof body.reason !== "string" || !Object.values(ReturnReason).includes(body.reason as ReturnReason) || !Array.isArray(body.items)) {
            return NextResponse.json({ success: false, message: "Invalid return request." }, { status: 400 });
        }

        const items = body.items.map((item) => {
            const row = item as { orderItemId?: unknown; quantity?: unknown };
            return { orderItemId: row.orderItemId, quantity: row.quantity };
        });
        if (items.some((item) => typeof item.orderItemId !== "string" || typeof item.quantity !== "number")) {
            return NextResponse.json({ success: false, message: "Invalid return item selection." }, { status: 400 });
        }

        const result = await createReturnRequest({
            userId,
            orderId: body.orderId,
            reason: body.reason as ReturnReason,
            customerNote: typeof body.customerNote === "string" ? body.customerNote : undefined,
            items: items as Array<{ orderItemId: string; quantity: number }>,
        });

        return NextResponse.json({ success: true, message: "Return request submitted.", data: result }, { status: 201 });
    } catch (error) {
        if (error instanceof ReturnError) {
            return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
        }
        console.error("[returns:create]", error);
        return NextResponse.json({ success: false, message: "Could not submit the return request." }, { status: 500 });
    }
}
