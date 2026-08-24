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

        await prisma.payment.updateMany({
            where: {
                orderId: order.id,
                status: "PENDING",
            },
            data: {
                status: "FAILED",
                transactionId: tran_id,
            },
        });

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