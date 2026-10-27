import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
        return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    let body: { shipmentId?: unknown; email?: unknown };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ success: false, message: "Invalid request body." }, { status: 400 });
    }

    const shipmentId = typeof body.shipmentId === "string" ? body.shipmentId.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!shipmentId || !email) {
        return NextResponse.json({ success: false, message: "Shipment ID and courier email are required." }, { status: 400 });
    }

    const [shipment, courier] = await Promise.all([
        prisma.shipment.findUnique({
            where: { id: shipmentId },
            select: { id: true, fulfillmentStatus: true, status: true },
        }),
        prisma.user.findUnique({
            where: { email },
            select: { id: true, name: true, email: true, phone: true, isBlocked: true },
        }),
    ]);

    if (!shipment) {
        return NextResponse.json({ success: false, message: "Shipment not found." }, { status: 404 });
    }

    if (!courier || courier.isBlocked) {
        return NextResponse.json({ success: false, message: "No active user found with that email." }, { status: 404 });
    }

    if (shipment.fulfillmentStatus !== "DISPATCHED") {
        return NextResponse.json({ success: false, message: "Only dispatched shipments can be assigned to a courier." }, { status: 409 });
    }

    const updated = await prisma.shipment.update({
        where: { id: shipmentId },
        data: { assignedCourierId: courier.id },
        select: {
            id: true,
            assignedCourier: { select: { id: true, name: true, email: true, phone: true } },
        },
    });

    return NextResponse.json({ success: true, message: "Courier assigned successfully.", data: updated });
}
