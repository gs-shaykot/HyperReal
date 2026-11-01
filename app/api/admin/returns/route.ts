import {
    PaymentMethod,
    PaymentStatus,
    RefundMethod,
    RefundStatus,
    Prisma,
    ReturnEventType,
    ReturnItemCondition,
    ReturnStatus,
} from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ReturnError } from "@/lib/service/returnService";

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.sessionRevoked) return null;
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, role: true, isBlocked: true },
    });
    return user && user.role === "ADMIN" && !user.isBlocked ? user : null;
}

type Body = {
    returnId?: unknown;
    action?: unknown;
    note?: unknown;
    items?: unknown;
};

function responseError(error: unknown) {
    if (error instanceof ReturnError) {
        return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("[admin:returns]", error);
    return NextResponse.json({ success: false, message: "Could not update this return request." }, { status: 500 });
}

export async function GET(request: Request) {
    try {
        if (!(await requireAdmin())) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const validStatus = status && Object.values(ReturnStatus).includes(status as ReturnStatus) ? status as ReturnStatus : undefined;
        const returns = await prisma.returnRequest.findMany({
            where: validStatus ? { status: validStatus } : undefined,
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { id: true, name: true, email: true, phone: true } },
                order: {
                    select: {
                        orderCode: true,
                        status: true,
                        payments: { orderBy: { createdAt: "desc" }, take: 1, select: { method: true, status: true, paidAmountInUSD: true, paidAmountInBDT: true, paymentIntentId: true, stripeChargeId: true } },
                        shipment: { select: { deliveredAt: true, trackingCode: true } },
                    },
                },
                items: {
                    include: {
                        orderItem: { select: { quantity: true, priceAtPurchase: true, variant: { select: { size: true, color: true, product: { select: { name: true } } } } } },
                    },
                },
                events: { orderBy: { createdAt: "asc" } },
                refund: true,
            },
        });
        return NextResponse.json({ success: true, data: returns });
    } catch (error) {
        return responseError(error);
    }
}

export async function POST(request: Request) {
    try {
        const admin = await requireAdmin();
        if (!admin) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
        const body = await request.json().catch(() => null) as Body | null;
        if (!body || typeof body.returnId !== "string" || typeof body.action !== "string") {
            return NextResponse.json({ success: false, message: "Return ID and action are required." }, { status: 400 });
        }
        const returnId = body.returnId;
        const note = typeof body.note === "string" ? body.note.trim().slice(0, 2000) : "";

        const result = await prisma.$transaction(async (tx) => {
            const record = await tx.returnRequest.findUnique({
                where: { id: returnId },
                include: {
                    items: { include: { orderItem: { select: { id: true, quantity: true, priceAtPurchase: true, variantId: true } } } },
                    order: {
                        select: {
                            id: true,
                            status: true,
                            payments: { orderBy: { createdAt: "desc" }, take: 1, select: { method: true, status: true, paidAmountInUSD: true, paidAmountInBDT: true, discount: true } },
                        },
                    },
                },
            });
            if (!record) throw new ReturnError("Return request not found.", 404);

            let auditEventId: string | null = null;
            const event = async (type: ReturnEventType, title: string, description?: string) => {
                const created = await tx.returnEvent.create({
                    data: { returnRequestId: record.id, actorId: admin.id, type, title, description, metadata: { action: body.action, statusBefore: record.status } },
                    select: { id: true },
                });
                auditEventId = created.id;
                return created;
            };
            const updateStatus = async (expected: ReturnStatus[], next: ReturnStatus) => {
                const changed = await tx.returnRequest.updateMany({
                    where: { id: record.id, status: { in: expected } },
                    data: { status: next, adminNote: note || undefined, reviewedById: admin.id, reviewedAt: new Date() },
                });
                if (changed.count !== 1) throw new ReturnError("Return status changed. Refresh and try again.", 409);
            };

            switch (body.action) {
                case "APPROVE":
                    if (record.status !== ReturnStatus.REQUESTED) throw new ReturnError("Only new requests can be approved.", 409);
                    await updateStatus([ReturnStatus.REQUESTED], ReturnStatus.APPROVED);
                    for (const item of record.items) {
                        await tx.returnItem.update({
                            where: { id: item.id },
                            data: { approvedQuantity: item.requestedQuantity },
                        });
                    }
                    await event(ReturnEventType.APPROVED, "Return approved", note || "The return request was approved.");
                    break;

                case "REJECT":
                    if (record.status !== ReturnStatus.REQUESTED) throw new ReturnError("Only new requests can be rejected.", 409);
                    if (!note) throw new ReturnError("Provide a reason when rejecting a return.");
                    await updateStatus([ReturnStatus.REQUESTED], ReturnStatus.REJECTED);
                    await event(ReturnEventType.REJECTED, "Return rejected", note);
                    break;

                case "MARK_RECEIVED":
                    if (record.status !== ReturnStatus.APPROVED && record.status !== ReturnStatus.IN_TRANSIT) throw new ReturnError("Only approved or in-transit returns can be received.", 409);
                    await updateStatus([record.status], ReturnStatus.RECEIVED);
                    await tx.returnRequest.update({ where: { id: record.id }, data: { receivedAt: new Date() } });
                    await event(ReturnEventType.RECEIVED, "Returned parcel received", note || "The returned parcel was received by the warehouse.");
                    break;

                case "START_INSPECTION":
                    if (record.status !== ReturnStatus.RECEIVED) throw new ReturnError("The parcel must be received before inspection.", 409);
                    await updateStatus([ReturnStatus.RECEIVED], ReturnStatus.INSPECTING);
                    await event(ReturnEventType.INSPECTION_STARTED, "Inspection started", note || "Warehouse inspection started.");
                    break;

                case "INSPECT": {
                    if (record.status !== ReturnStatus.INSPECTING) throw new ReturnError("The return must be under inspection.", 409);
                    if (!Array.isArray(body.items) || body.items.length !== record.items.length) throw new ReturnError("Submit an inspection result for every returned item.");
                    const submitted = new Map<string, { condition: ReturnItemCondition; receivedQuantity: number; restockQuantity: number; inspectionNote?: string }>();
                    for (const raw of body.items) {
                        const item = raw as Record<string, unknown>;
                        if (typeof item.returnItemId !== "string" || typeof item.condition !== "string" || !Object.values(ReturnItemCondition).includes(item.condition as ReturnItemCondition) || typeof item.receivedQuantity !== "number" || !Number.isSafeInteger(item.receivedQuantity) || typeof item.restockQuantity !== "number" || !Number.isSafeInteger(item.restockQuantity)) {
                            throw new ReturnError("Invalid inspection item data.");
                        }
                        if (submitted.has(item.returnItemId)) throw new ReturnError("Duplicate inspection item.");
                        submitted.set(item.returnItemId, {
                            condition: item.condition as ReturnItemCondition,
                            receivedQuantity: item.receivedQuantity as number,
                            restockQuantity: item.restockQuantity as number,
                            inspectionNote: typeof item.inspectionNote === "string" ? item.inspectionNote.slice(0, 1000) : undefined,
                        });
                    }
                    const inspectionClaim = await tx.returnRequest.updateMany({
                        where: { id: record.id, status: ReturnStatus.INSPECTING },
                        data: { status: ReturnStatus.REFUND_APPROVED },
                    });
                    if (inspectionClaim.count !== 1) throw new ReturnError("Inspection was already submitted. Refresh the return before continuing.", 409);
                    let allItemsRejected = true;
                    for (const item of record.items) {
                        const input = submitted.get(item.id);
                        if (!input || input.receivedQuantity < 0 || input.receivedQuantity > item.requestedQuantity || input.restockQuantity < 0 || input.restockQuantity > input.receivedQuantity) throw new ReturnError("Inspection quantities are outside the allowed range.");
                        const restockableConditions: ReturnItemCondition[] = [ReturnItemCondition.SEALED, ReturnItemCondition.GOOD];
                        if (input.restockQuantity > 0 && !restockableConditions.includes(input.condition)) throw new ReturnError("Only sealed or good-condition items can be restocked.");
                        const eligible = Math.min(item.approvedQuantity || item.requestedQuantity, input.receivedQuantity);
                        if (eligible > 0) allItemsRejected = false;
                        const payment = record.order.payments[0];
                        const allOrderItems = await tx.orderItem.findMany({
                            where: { orderId: record.orderId },
                            select: { quantity: true, priceAtPurchase: true },
                        });
                        const grossSubtotal = allOrderItems.reduce(
                            (sum, current) => sum + current.priceAtPurchase * current.quantity,
                            0,
                        );
                        const grossLineTotal = item.orderItem.priceAtPurchase * item.orderItem.quantity;
                        const allocatedDiscount = grossSubtotal > 0 && payment
                            ? Math.max(0, payment.discount) * (grossLineTotal / grossSubtotal)
                            : 0;
                        const netLineTotal = Math.max(0, grossLineTotal - allocatedDiscount);
                        const netUnitPrice = item.orderItem.quantity > 0
                            ? netLineTotal / item.orderItem.quantity
                            : 0;
                        const refundAmount = eligible * netUnitPrice;
                        await tx.returnItem.update({
                            where: { id: item.id },
                            data: {
                                condition: input.condition,
                                receivedQuantity: input.receivedQuantity,
                                restockQuantity: input.restockQuantity,
                                inspectionNote: input.inspectionNote,
                                refundAmount,
                            },
                        });
                        if (input.restockQuantity > 0) {
                            await tx.productVariant.update({
                                where: { id: item.orderItem.variantId },
                                data: { stock: { increment: input.restockQuantity } },
                            });
                        }
                    }
                    await tx.returnRequest.update({ where: { id: record.id }, data: { status: allItemsRejected ? ReturnStatus.CLOSED : ReturnStatus.REFUND_APPROVED, inspectedAt: new Date(), closedAt: allItemsRejected ? new Date() : null, adminNote: note || undefined } });
                    await event(ReturnEventType.INSPECTED, "Inspection completed", note || "Item conditions and quantities were recorded.");
                    if (!allItemsRejected) await event(ReturnEventType.REFUND_APPROVED, "Refund approved", "Refund amount calculated from inspected and received quantities.");
                    break;
                }

                case "CONFIRM_MANUAL_REFUND": {
                    if (record.status !== ReturnStatus.REFUND_PROCESSING) throw new ReturnError("This return is not awaiting a manual refund.", 409);
                    const refund = await tx.refund.findUnique({ where: { returnRequestId: record.id } });
                    if (!refund || refund.method === RefundMethod.STRIPE || refund.status !== RefundStatus.REQUIRES_MANUAL_ACTION) throw new ReturnError("This refund is not eligible for manual confirmation.", 409);
                    if (!note) throw new ReturnError("Enter the verified bank, mobile-wallet or cash refund reference before confirming.", 400);
                    await tx.refund.update({ where: { id: refund.id }, data: { status: RefundStatus.SUCCEEDED, processedAt: new Date(), processedById: admin.id, failureReason: null } });
                    await tx.returnRequest.update({ where: { id: record.id }, data: { status: ReturnStatus.REFUNDED, closedAt: new Date(), adminNote: note } });
                    await event(ReturnEventType.REFUND_SUCCEEDED, "Manual refund confirmed", note);
                    break;
                }

                case "CREATE_REFUND": {
                    if (record.status !== ReturnStatus.REFUND_APPROVED) throw new ReturnError("Complete inspection and approve the refund first.", 409);
                    const payment = record.order.payments[0];
                    if (!payment || payment.status !== PaymentStatus.SUCCESS) throw new ReturnError("Only successfully paid orders can be refunded.", 409);
                    const refundInUSD = record.items.reduce((sum, item) => sum + Number(item.refundAmount), 0);
                    if (!Number.isFinite(refundInUSD) || refundInUSD <= 0) throw new ReturnError("The inspected return has no refundable amount.");
                    const method = payment.method === PaymentMethod.STRIPE ? RefundMethod.STRIPE : payment.method === PaymentMethod.SSLC ? RefundMethod.SSLC : RefundMethod.COD_MANUAL;
                    const currency = payment.method === PaymentMethod.STRIPE ? "USD" : payment.paidAmountInBDT > 0 ? "BDT" : "USD";
                    const paidUSD = payment.paidAmountInUSD;
                    const conversionRate = currency === "BDT" && paidUSD > 0 ? payment.paidAmountInBDT / paidUSD : 1;
                    const total = Number((refundInUSD * conversionRate).toFixed(2));
                    const paid = currency === "BDT" ? payment.paidAmountInBDT : paidUSD;
                    // Serialize refund-cap checks per order so two partial returns cannot race past the cumulative paid-amount ceiling.
                    await tx.$queryRaw`SELECT "id" FROM "Order" WHERE "id" = ${record.order.id} FOR UPDATE`;
                    const priorRefunds = await tx.refund.aggregate({
                        where: {
                            returnRequest: { orderId: record.order.id },
                            status: { in: [RefundStatus.PENDING, RefundStatus.PROCESSING, RefundStatus.SUCCEEDED, RefundStatus.REQUIRES_MANUAL_ACTION] },
                            currency,
                        },
                        _sum: { amount: true },
                    });
                    const alreadyRefunded = Number(priorRefunds._sum.amount ?? 0);
                    if (alreadyRefunded + total > paid + 0.0001) throw new ReturnError("This refund plus previous refunds would exceed the amount paid for the order.", 409);
                    if (total > paid + 0.0001) throw new ReturnError("Refund exceeds the original paid amount.", 409);
                    await tx.refund.create({
                        data: {
                            returnRequestId: record.id,
                            method,
                            amount: new Prisma.Decimal(total.toFixed(2)),
                            currency,
                            idempotencyKey: `return-refund:${record.id}`,
                            status: method === RefundMethod.STRIPE ? RefundStatus.PENDING : RefundStatus.REQUIRES_MANUAL_ACTION,
                        },
                    });
                    await tx.returnRequest.update({ where: { id: record.id }, data: { status: ReturnStatus.REFUND_PROCESSING } });
                    await event(ReturnEventType.REFUND_INITIATED, "Refund initiated", method === RefundMethod.STRIPE ? "Stripe refund is queued for provider processing." : "Refund requires gateway or manual processing.");
                    break;
                }

                default:
                    throw new ReturnError("Unknown return action.", 400);
            }

            if (auditEventId) {
                const after = await tx.returnRequest.findUnique({ where: { id: record.id }, select: { status: true } });
                await tx.returnEvent.update({
                    where: { id: auditEventId },
                    data: { metadata: { action: body.action, statusBefore: record.status, statusAfter: after?.status ?? record.status, adminId: admin.id, adminNote: note || null } },
                });
            }

            const notificationCopy: Record<string, { title: string; message: string }> = {
                APPROVE: { title: "Return approved", message: `Your return ${record.returnCode} has been approved. Follow the return instructions in your account.` },
                REJECT: { title: "Return request update", message: `Your return ${record.returnCode} was not approved. Open your return details to see the reason.` },
                MARK_IN_TRANSIT: { title: "Return in transit", message: `Your return ${record.returnCode} has been marked as in transit.` },
                MARK_RECEIVED: { title: "Return received", message: `We've received the parcel for return ${record.returnCode}.` },
                START_INSPECTION: { title: "Inspection started", message: `Warehouse inspection has started for return ${record.returnCode}.` },
                INSPECT: { title: "Inspection completed", message: `Inspection is complete for return ${record.returnCode}. Your refund is being prepared.` },
                CREATE_REFUND: { title: "Refund initiated", message: `A refund has been initiated for return ${record.returnCode}. We'll update you when it is confirmed.` },
                CONFIRM_MANUAL_REFUND: { title: "Refund completed", message: `Your refund for return ${record.returnCode} has been confirmed.` },
            };
            const notice = notificationCopy[String(body.action)];
            if (notice) await tx.notification.create({
                data: { userId: record.userId, type: "RETURN_UPDATE", title: notice.title, message: notice.message, href: "/account/returns", metadata: { returnId: record.id, returnCode: record.returnCode, action: body.action } },
            });

            return tx.returnRequest.findUniqueOrThrow({
                where: { id: record.id },
                include: { items: true, events: { orderBy: { createdAt: "asc" } }, refund: true },
            });
        });

        return NextResponse.json({ success: true, data: result, message: "Return request updated." });
    } catch (error) {
        return responseError(error);
    }
}
