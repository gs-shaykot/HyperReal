import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.sessionRevoked) return null;
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, isBlocked: true },
    });
    return user && user.role === "ADMIN" && !user.isBlocked;
}

export async function GET() {
    try {
        if (!(await requireAdmin())) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
        const zones = await prisma.deliveryZone.findMany({
            orderBy: [{ country: "asc" }, { city: "asc" }, { name: "asc" }],
            select: {
                id: true, name: true, city: true, country: true, isActive: true,
                _count: { select: { couriers: true, shipments: true } },
            },
        });
        return NextResponse.json({ success: true, data: zones });
    } catch (error) {
        console.error("Delivery zones load failed:", error);
        return NextResponse.json({ success: false, message: "Could not load delivery zones." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        if (!(await requireAdmin())) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
        const body = await request.json().catch(() => null) as { name?: unknown; city?: unknown; country?: unknown } | null;
        const name = typeof body?.name === "string" ? body.name.trim() : "";
        const city = typeof body?.city === "string" ? body.city.trim() : "";
        const country = typeof body?.country === "string" ? body.country.trim() : "";
        if (!name || !city || !country || name.length > 80 || city.length > 80 || country.length > 80) {
            return NextResponse.json({ success: false, message: "Zone name, city, and country are required (maximum 80 characters each)." }, { status: 400 });
        }
        const zone = await prisma.deliveryZone.create({
            data: { name, city, country },
            select: { id: true, name: true, city: true, country: true, isActive: true },
        });
        return NextResponse.json({ success: true, message: "Delivery zone created.", data: zone }, { status: 201 });
    } catch (error) {
        if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
            return NextResponse.json({ success: false, message: "This zone already exists." }, { status: 409 });
        }
        console.error("Delivery zone creation failed:", error);
        return NextResponse.json({ success: false, message: "Could not create delivery zone." }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        if (!(await requireAdmin())) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
        const body = await request.json().catch(() => null) as { id?: unknown; isActive?: unknown } | null;
        const id = typeof body?.id === "string" ? body.id : "";
        if (!id || typeof body?.isActive !== "boolean") {
            return NextResponse.json({ success: false, message: "Zone ID and active status are required." }, { status: 400 });
        }
        const zone = await prisma.deliveryZone.update({
            where: { id },
            data: { isActive: body.isActive },
            select: { id: true, name: true, city: true, country: true, isActive: true },
        });
        return NextResponse.json({ success: true, message: "Delivery zone updated.", data: zone });
    } catch (error) {
        console.error("Delivery zone update failed:", error);
        return NextResponse.json({ success: false, message: "Could not update delivery zone." }, { status: 500 });
    }
}
