import prisma from "@/lib/prisma";
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
                payments: { select: { method: true, status: true } },
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

        // A browser-return callback containing only tran_id is not proof that
        // the gateway transaction failed. Keep the reservation until a trusted
        // gateway validation/reconciliation confirms its terminal state.

        if (order.payments.some((payment) => payment.method !== "SSLC")) {
            return NextResponse.json({ success: false, message: "Payment method mismatch." }, { status: 400 });
        }

        return NextResponse.redirect(
            `${process.env.BASE_URL}/failed?orderId=${order.id}`
        );

    } catch (error) {
        console.error("SSLCOMMERZ fail callback error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Payment failure processing failed.",
            },
            { status: 500 }
        );
    }
}