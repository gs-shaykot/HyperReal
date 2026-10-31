import prisma from "@/lib/prisma";
import { getSslCommerzTransactionState } from "@/lib/service/sslcommerzService";
import { releaseOrderStock } from "@/lib/service/paymentService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const tran_id = formData.get("tran_id")?.toString();

        if (!tran_id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid transaction.",
                },
                { status: 400 }
            );
        }

        const order = await prisma.order.findUnique({
            where: {
                orderCode: tran_id,
            },
            select: {
                id: true,
                payments: { select: { method: true, status: true, sslSessionKey: true } },
            },
        });

        if (!order) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Order not found.",
                },
                { status: 404 }
            );
        }

        if (
            order.payments.length !== 1 ||
            order.payments[0].method !== "SSLC"
        ) {
            return NextResponse.json(
                { success: false, message: "Payment method mismatch." },
                { status: 400 }
            );
        }

        // Never trust the browser callback by itself. Query SSLCommerz using
        // our merchant transaction ID and release only a confirmed failed/cancelled
        // transaction. Unknown states retain the reservation for reconciliation.
        if (order.payments[0].status === "PENDING") {
            const gatewayState = await getSslCommerzTransactionState(
                tran_id,
                order.payments[0].sslSessionKey
            );
            if (gatewayState === "FAILED") {
                await releaseOrderStock(order.id);
            } else if (gatewayState === "UNKNOWN") {
            }
        }

        return NextResponse.redirect(
            new URL(`/cancel?orderId=${order.id}`, process.env.BASE_URL),
            303
        );

    } catch (error) {

        return NextResponse.json(
            {
                success: false,
                message: "Payment cancellation processing failed.",
            },
            { status: 500 }
        );
    }
}