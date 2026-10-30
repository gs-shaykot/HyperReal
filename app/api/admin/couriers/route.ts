import { Prisma, Role } from "@prisma/client";
import { randomBytes } from "node:crypto";
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

        const [couriers, zones] = await Promise.all([
            prisma.courierProfile.findMany({
                orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
                select: {
                    id: true,
                    courierCode: true,
                    vehicleType: true,
                    isActive: true,
                    createdAt: true,
                    user: { select: { id: true, name: true, email: true, phone: true, isBlocked: true } },
                    zone: { select: { id: true, name: true, city: true, country: true, isActive: true } },
                },
            }),
            prisma.deliveryZone.findMany({
                orderBy: [{ country: "asc" }, { city: "asc" }, { name: "asc" }],
                select: { id: true, name: true, city: true, country: true, isActive: true },
            }),
        ]);

        const courierIds = couriers.map((courier) => courier.user.id);
        const workload = await prisma.shipment.groupBy({
            by: ["assignedCourierId"],
            where: { assignedCourierId: { in: courierIds }, status: { not: "DELIVERED" } },
            _count: { _all: true },
        });
        const workloadByCourier = new Map(workload.map((item) => [item.assignedCourierId, item._count._all]));

        return NextResponse.json({
            success: true,
            data: {
                couriers: couriers.map((courier) => ({
                    ...courier,
                    activeDeliveries: workloadByCourier.get(courier.user.id) ?? 0,
                })),
                zones,
            },
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Could not load courier directory." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const admin = await requireAdmin();
        if (!admin) {
            return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
        }

        const body = await request.json().catch(() => null) as {
            email?: unknown; zoneId?: unknown; vehicleType?: unknown;
        } | null;
        const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
        const zoneId = typeof body?.zoneId === "string" && body.zoneId ? body.zoneId : null;
        const vehicleType = typeof body?.vehicleType === "string" ? body.vehicleType.trim().slice(0, 60) : null;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ success: false, message: "Enter a valid existing account email." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, name: true, email: true, role: true, isBlocked: true, courierProfile: { select: { id: true } } },
        });

        if (!user || user.isBlocked) {
            return NextResponse.json({ success: false, message: "An active existing account is required." }, { status: 404 });
        }
        if (user.role === Role.ADMIN || user.role === Role.MANAGER) {
            return NextResponse.json({ success: false, message: "Admin and manager accounts cannot be registered as couriers." }, { status: 409 });
        }
        if (user.courierProfile) {
            return NextResponse.json({ success: false, message: "This account is already registered as a courier." }, { status: 409 });
        }

        if (zoneId) {
            const zone = await prisma.deliveryZone.findFirst({ where: { id: zoneId, isActive: true }, select: { id: true } });
            if (!zone) return NextResponse.json({ success: false, message: "Choose an active delivery zone." }, { status: 400 });
        }

        // The old code used the first eight UUID characters, which can collide
        // with existing demo/seeded courier codes. Generate a unique random code
        // and retry only if another request happens to claim the same code.
        let profile = null;
        for (let attempt = 0; attempt < 5; attempt += 1) {
            const courierCode = `HYP-RDR-${randomBytes(4).toString("hex").toUpperCase()}`;
            try {
                profile = await prisma.$transaction(async (tx) => {
                    const updatedUser = await tx.user.updateMany({
                        where: { id: user.id, role: Role.USER, isBlocked: false },
                        data: { role: Role.COURIER },
                    });
                    if (updatedUser.count !== 1) throw new Error("ACCOUNT_ROLE_CHANGED");

                    return tx.courierProfile.create({
                        data: {
                            userId: user.id,
                            courierCode,
                            zoneId,
                            vehicleType: vehicleType || null,
                        },
                        select: {
                            id: true, courierCode: true, vehicleType: true, isActive: true,
                            user: { select: { id: true, name: true, email: true, phone: true, isBlocked: true } },
                            zone: { select: { id: true, name: true, city: true, country: true, isActive: true } },
                        },
                    });
                });
                break;
            } catch (error) {
                const duplicateCourierCode =
                    error instanceof Prisma.PrismaClientKnownRequestError &&
                    error.code === "P2002" &&
                    Array.isArray(error.meta?.target) &&
                    error.meta.target.some((field) => String(field).includes("courierCode"));
                if (!duplicateCourierCode || attempt === 4) throw error;
            }
        }

        if (!profile) {
            return NextResponse.json({ success: false, message: "Could not generate a unique courier code. Please retry." }, { status: 409 });
        }

        return NextResponse.json({ success: true, message: "Courier registered.", data: profile }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Could not register this courier." }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        if (!(await requireAdmin())) {
            return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
        }

        const body = await request.json().catch(() => null) as {
            profileId?: unknown; isActive?: unknown; zoneId?: unknown; vehicleType?: unknown;
        } | null;
        const profileId = typeof body?.profileId === "string" ? body.profileId : "";
        if (!profileId) return NextResponse.json({ success: false, message: "Courier profile is required." }, { status: 400 });

        const data: { isActive?: boolean; zoneId?: string | null; vehicleType?: string | null } = {};
        if (typeof body?.isActive === "boolean") data.isActive = body.isActive;
        if (typeof body?.zoneId === "string" || body?.zoneId === null) {
            const zoneId = body.zoneId as string | null;
            if (zoneId) {
                const zone = await prisma.deliveryZone.findFirst({ where: { id: zoneId, isActive: true }, select: { id: true } });
                if (!zone) return NextResponse.json({ success: false, message: "Choose an active zone." }, { status: 400 });
            }
            data.zoneId = zoneId;
        }
        if (typeof body?.vehicleType === "string") data.vehicleType = body.vehicleType.trim().slice(0, 60) || null;

        if (!Object.keys(data).length) return NextResponse.json({ success: false, message: "No valid changes supplied." }, { status: 400 });

        const profile = await prisma.courierProfile.update({
            where: { id: profileId },
            data,
            select: { id: true, courierCode: true, vehicleType: true, isActive: true, zoneId: true },
        });

        return NextResponse.json({ success: true, message: "Courier updated.", data: profile });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Could not update courier." }, { status: 500 });
    }
}
