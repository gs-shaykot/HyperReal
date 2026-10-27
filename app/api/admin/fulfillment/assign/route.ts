import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.sessionRevoked) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, role: true, isBlocked: true },
    });

    return user && user.role === Role.ADMIN && !user.isBlocked ? user : null;
}

export async function GET() {
    try {
        if (!(await requireAdmin())) {
            return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
        }

        const couriers = await prisma.courierProfile.findMany({
            where: {
                isActive: true,
                user: { isBlocked: false, role: Role.COURIER },
            },
            orderBy: [{ zone: { city: "asc" } }, { user: { name: "asc" } }],
            select: {
                id: true,
                courierCode: true,
                vehicleType: true,
                zoneId: true,
                user: { select: { id: true, name: true, email: true, phone: true } },
                zone: { select: { id: true, name: true, city: true, country: true, isActive: true } },
            },
        });

        return NextResponse.json({ success: true, data: couriers });
    } catch (error) {
        console.error("Eligible courier lookup failed:", error);
        return NextResponse.json({ success: false, message: "Could not load eligible couriers." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        if (!(await requireAdmin())) {
            return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
        }

        const body = await request.json().catch(() => null) as {
            shipmentId?: unknown;
            courierProfileId?: unknown;
            zoneId?: unknown;
        } | null;

        const shipmentId = typeof body?.shipmentId === "string" ? body.shipmentId.trim() : "";
        const courierProfileId = typeof body?.courierProfileId === "string" ? body.courierProfileId.trim() : "";
        const zoneId = typeof body?.zoneId === "string" ? body.zoneId.trim() : "";

        if (!shipmentId || !courierProfileId || !zoneId) {
            return NextResponse.json({ success: false, message: "Shipment, zone, and courier are required." }, { status: 400 });
        }

        const [shipment, zone, courier] = await Promise.all([
            prisma.shipment.findUnique({
                where: { id: shipmentId },
                select: { id: true, fulfillmentStatus: true, status: true, deliveryZoneId: true },
            }),
            prisma.deliveryZone.findFirst({
                where: { id: zoneId, isActive: true },
                select: { id: true },
            }),
            prisma.courierProfile.findFirst({
                where: {
                    id: courierProfileId,
                    isActive: true,
                    user: { role: Role.COURIER, isBlocked: false },
                    zoneId,
                    zone: { isActive: true },
                },
                select: {
                    id: true,
                    user: { select: { id: true, name: true, email: true, phone: true } },
                },
            }),
        ]);

        if (!shipment) return NextResponse.json({ success: false, message: "Shipment not found." }, { status: 404 });
        if (shipment.fulfillmentStatus !== "DISPATCHED") {
            return NextResponse.json({ success: false, message: "Only dispatched shipments can be assigned." }, { status: 409 });
        }
        if (!zone) return NextResponse.json({ success: false, message: "Choose an active delivery zone." }, { status: 400 });
        if (!courier) return NextResponse.json({ success: false, message: "Choose an active courier assigned to this zone." }, { status: 400 });

        const updated = await prisma.shipment.update({
            where: { id: shipmentId },
            data: { assignedCourierId: courier.user.id, deliveryZoneId: zoneId },
            select: {
                id: true,
                deliveryZoneId: true,
                assignedCourier: { select: { id: true, name: true, email: true, phone: true } },
                deliveryZone: { select: { id: true, name: true, city: true, country: true } },
            },
        });

        return NextResponse.json({ success: true, message: "Courier assigned successfully.", data: updated });
    } catch (error) {
        console.error("Courier assignment failed:", error);
        return NextResponse.json({ success: false, message: "Could not assign courier." }, { status: 500 });
    }
}
