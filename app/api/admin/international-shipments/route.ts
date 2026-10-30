import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const CUSTOMS_STATUSES = new Set(["NOT_REQUIRED", "DOCUMENTS_PENDING", "DOCUMENTS_READY", "UNDER_REVIEW", "CLEARED", "ON_HOLD"]);
const INTERNATIONAL_STATUSES = new Set(["PREPARING", "HANDED_TO_CARRIER", "IN_TRANSIT", "CUSTOMS_CLEARANCE", "OUT_FOR_DELIVERY", "DELIVERED", "EXCEPTION", "RETURNING"]);

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.sessionRevoked) return false;
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, isBlocked: true },
    });
    return !!user && user.role === "ADMIN" && !user.isBlocked;
}

export async function GET(request: Request) {
    try {
        if (!(await requireAdmin())) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
        const { searchParams } = new URL(request.url);
        const country = searchParams.get("country")?.trim();
        const status = searchParams.get("status")?.trim();
        const shipments = await prisma.shipment.findMany({
            where: {
                OR: [
                    { shippingType: "INTERNATIONAL" },
                    { order: { orderHistory: { is: { country: { not: "Bangladesh" } } } } },
                ],
                ...(status && status !== "ALL" ? { status: status as "PENDING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "FAILED" } : {}),
                ...(country && country !== "ALL" ? { order: { orderHistory: { is: { country: { equals: country, mode: "insensitive" } } } } } : {}),
            },
            orderBy: { updatedAt: "desc" },
            take: 200,
            select: {
                id: true, trackingCode: true, status: true, fulfillmentStatus: true, shippingType: true, internationalStatus: true,
                carrierName: true, carrierTrackingNumber: true, estimatedDeliveryAt: true, customsStatus: true,
                internationalNotes: true, dispatchedAt: true, deliveredAt: true, updatedAt: true,
                order: {
                    select: {
                        id: true, orderCode: true, status: true, createdAt: true,
                        user: { select: { name: true, email: true } },
                        orderHistory: { select: { fullName: true, street: true, house: true, city: true, zipCode: true, country: true, phone: true } },
                        payments: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true, method: true, paidAmountInUSD: true } },
                    },
                },
            },
        });
        const countries = [...new Set(shipments.map((item) => item.order.orderHistory?.country).filter((value): value is string => !!value))].sort();
        return NextResponse.json({ success: true, data: { shipments, countries } });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Could not load international shipments." }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        if (!(await requireAdmin())) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
        const body = await request.json().catch(() => null) as {
            shipmentId?: unknown; carrierName?: unknown; carrierTrackingNumber?: unknown;
            estimatedDeliveryAt?: unknown; customsStatus?: unknown; internationalNotes?: unknown; internationalStatus?: unknown;
        } | null;
        const shipmentId = typeof body?.shipmentId === "string" ? body.shipmentId.trim() : "";
        if (!shipmentId) return NextResponse.json({ success: false, message: "Shipment ID is required." }, { status: 400 });
        const shipment = await prisma.shipment.findUnique({
            where: { id: shipmentId },
            select: { id: true, order: { select: { orderHistory: { select: { country: true } } } } },
        });
        if (!shipment) return NextResponse.json({ success: false, message: "Shipment not found." }, { status: 404 });
        const country = shipment.order.orderHistory?.country;
        if (!country || country.toLowerCase() === "bangladesh") {
            return NextResponse.json({ success: false, message: "This shipment is not an international destination." }, { status: 409 });
        }
        if (typeof body?.customsStatus === "string" && !CUSTOMS_STATUSES.has(body.customsStatus)) {
            return NextResponse.json({ success: false, message: "Invalid customs status." }, { status: 400 });
        }
        if (typeof body?.internationalStatus === "string" && !INTERNATIONAL_STATUSES.has(body.internationalStatus)) {
            return NextResponse.json({ success: false, message: "Invalid international delivery status." }, { status: 400 });
        }
        const carrierName = typeof body?.carrierName === "string" ? body.carrierName.trim().slice(0, 100) : null;
        const carrierTrackingNumber = typeof body?.carrierTrackingNumber === "string" ? body.carrierTrackingNumber.trim().slice(0, 120) : null;
        const internationalNotes = typeof body?.internationalNotes === "string" ? body.internationalNotes.trim().slice(0, 2000) : null;
        let estimatedDeliveryAt: Date | null | undefined;
        if (body?.estimatedDeliveryAt === null || body?.estimatedDeliveryAt === "") estimatedDeliveryAt = null;
        else if (typeof body?.estimatedDeliveryAt === "string") {
            estimatedDeliveryAt = new Date(body.estimatedDeliveryAt);
            if (Number.isNaN(estimatedDeliveryAt.getTime())) return NextResponse.json({ success: false, message: "Invalid estimated delivery date." }, { status: 400 });
        }
        const before = await prisma.shipment.findUnique({
            where: { id: shipmentId },
            select: {
                id: true, orderId: true, status: true, shippingType: true, internationalStatus: true,
                carrierName: true, carrierTrackingNumber: true, estimatedDeliveryAt: true,
                customsStatus: true, internationalNotes: true,
            },
        });
        if (!before) return NextResponse.json({ success: false, message: "Shipment not found." }, { status: 404 });

        const nextCarrier = carrierName !== null ? (carrierName || null) : before.carrierName;
        const nextTracking = carrierTrackingNumber !== null ? (carrierTrackingNumber || null) : before.carrierTrackingNumber;
        const nextCustoms = typeof body?.customsStatus === "string" ? body.customsStatus : before.customsStatus;
        const nextInternationalStatus = typeof body?.internationalStatus === "string" && INTERNATIONAL_STATUSES.has(body.internationalStatus) ? body.internationalStatus : before.internationalStatus;
        const internationalStatusChanged = nextInternationalStatus !== before.internationalStatus;
        const carrierChanged = nextCarrier !== before.carrierName || nextTracking !== before.carrierTrackingNumber;
        const customsChanged = nextCustoms !== before.customsStatus;
        const notesChanged = internationalNotes !== null && (internationalNotes || null) !== before.internationalNotes;
        const dateChanged = estimatedDeliveryAt !== undefined && estimatedDeliveryAt?.toISOString() !== before.estimatedDeliveryAt?.toISOString();

        const updated = await prisma.$transaction(async (tx) => {
            const shipment = await tx.shipment.update({
                where: { id: shipmentId },
                data: {
                    shippingType: "INTERNATIONAL",
                    internationalStatus: nextInternationalStatus,
                    ...(carrierName !== null ? { carrierName: carrierName || null } : {}),
                    ...(carrierTrackingNumber !== null ? { carrierTrackingNumber: carrierTrackingNumber || null } : {}),
                    ...(internationalNotes !== null ? { internationalNotes: internationalNotes || null } : {}),
                    ...(typeof body?.customsStatus === "string" ? { customsStatus: body.customsStatus } : {}),
                    ...(estimatedDeliveryAt !== undefined ? { estimatedDeliveryAt } : {}),
                },
                select: { id: true, carrierName: true, carrierTrackingNumber: true, estimatedDeliveryAt: true, customsStatus: true, internationalNotes: true, shippingType: true, internationalStatus: true },
            });

            const events: { title: string; description: string }[] = [];
            if (carrierChanged && (nextCarrier || nextTracking)) {
                events.push({
                    title: "International carrier assigned",
                    description: [nextCarrier ? `Carrier: ${nextCarrier}` : null, nextTracking ? `Tracking reference: ${nextTracking}` : null].filter(Boolean).join(" · "),
                });
            }
            if (internationalStatusChanged) {
                const messages: Record<string, { title: string; description: string }> = {
                    PREPARING: { title: "Preparing for export", description: "The international parcel is being prepared for export." },
                    HANDED_TO_CARRIER: { title: "Handed to international carrier", description: nextCarrier ? "The parcel has been handed to " + nextCarrier + "." : "The parcel has been handed to the international carrier." },
                    IN_TRANSIT: { title: "International shipment in transit", description: "The parcel is travelling through the international carrier network." },
                    CUSTOMS_CLEARANCE: { title: "Customs clearance in progress", description: "The parcel is being processed by customs." },
                    OUT_FOR_DELIVERY: { title: "Out for final delivery", description: "The destination delivery partner is taking the parcel to the recipient." },
                    DELIVERED: { title: "International parcel delivered", description: "The international parcel has been marked as delivered by the admin." },
                    EXCEPTION: { title: "International delivery exception", description: internationalNotes || "The international shipment needs attention." },
                    RETURNING: { title: "International parcel returning to sender", description: "The shipment is being returned to the sender." },
                };
                const event = messages[nextInternationalStatus];
                if (event) events.push(event);
            }
            if (customsChanged) {
                const labels: Record<string, string> = {
                    NOT_REQUIRED: "Customs documentation is not required.",
                    DOCUMENTS_PENDING: "Required customs documents are pending.",
                    DOCUMENTS_READY: "Customs documents have been prepared.",
                    UNDER_REVIEW: "The shipment is under customs review.",
                    CLEARED: "The shipment has been marked as customs cleared.",
                    ON_HOLD: "The shipment is on customs hold. Please review the shipping notes.",
                };
                events.push({ title: `Customs status updated: ${nextCustoms.replaceAll("_", " ")}`, description: labels[nextCustoms] ?? "International customs status updated." });
            }
            if (dateChanged && estimatedDeliveryAt) {
                events.push({ title: "Estimated delivery updated", description: `Current estimated delivery: ${estimatedDeliveryAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}.` });
            }
            if (notesChanged && internationalNotes) {
                events.push({ title: "International shipping update", description: internationalNotes });
            }
            if (internationalStatusChanged && nextInternationalStatus === "DELIVERED") {
                await tx.shipment.update({ where: { id: shipmentId }, data: { status: "DELIVERED", deliveredAt: new Date() } });
                await tx.order.update({ where: { id: before.orderId }, data: { status: "DELIVERED" } });
            } else if (internationalStatusChanged && nextInternationalStatus === "OUT_FOR_DELIVERY") {
                await tx.shipment.update({ where: { id: shipmentId }, data: { status: "OUT_FOR_DELIVERY" } });
            } else if (internationalStatusChanged && nextInternationalStatus === "EXCEPTION") {
                await tx.shipment.update({ where: { id: shipmentId }, data: { status: "FAILED" } });
            }
            for (const event of events) {
                await tx.orderTrackingEvent.create({
                    data: {
                        orderId: before.orderId,
                        shipmentId,
                        type: "NOTE_ADDED",
                        title: event.title,
                        description: event.description,
                        metadata: { source: "international_shipping_admin" },
                    },
                });
            }
            return shipment;
        });
        return NextResponse.json({ success: true, message: "International shipping details saved and customer tracking updated.", data: updated });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Could not update international shipping details." }, { status: 500 });
    }
}
