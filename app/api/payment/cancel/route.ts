import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const formData = await req.formData();
    const tran_id = formData.get("tran_id") as string;

    const order = await prisma.order.findUnique({
        where: { orderCode: tran_id },
        select: { id: true },
    })

    const orderId = order?.id ?? null;

    if (orderId) {
        await prisma.payment.updateMany({
            where: { orderId: orderId },
            data: {
                status: "FAILED",
                transactionId: tran_id,
            },
        });
    }

    return NextResponse.redirect(`${process.env.BASE_URL}/cancel`);
}