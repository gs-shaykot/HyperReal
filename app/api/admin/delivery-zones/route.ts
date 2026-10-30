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
        return NextResponse.json({ success: false, message: "Could not create delivery zone." }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        if (!(await requireAdmin())) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
        const body = await request.json().catch(() => null) as { id?: unknown; isActive?: unknown; name?: unknown; city?: unknown; country?: unknown } | null;
        const id = typeof body?.id === "string" ? body.id.trim() : "";
        if (!id) return NextResponse.json({ success: false, message: "Zone ID is required." }, { status: 400 });
        const data: { isActive?: boolean; name?: string; city?: string; country?: string } = {};
        if (typeof body?.isActive === "boolean") data.isActive = body.isActive;
        for (const field of ["name", "city", "country"] as const) {
            if (body?.[field] !== undefined) {
                const value = typeof body[field] === "string" ? body[field].trim() : "";
                if (!value || value.length > 80) return NextResponse.json({ success: false, message: "Zone name, city, and country must be between 1 and 80 characters." }, { status: 400 });
                data[field] = value;
            }
        }
        if (!Object.keys(data).length) return NextResponse.json({ success: false, message: "No valid changes supplied." }, { status: 400 });
        const zone = await prisma.deliveryZone.update({
            where: { id },
            data,
            select: { id: true, name: true, city: true, country: true, isActive: true },
        });
        return NextResponse.json({ success: true, message: "Delivery zone updated.", data: zone });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Could not update delivery zone." }, { status: 500 });
    }
}
