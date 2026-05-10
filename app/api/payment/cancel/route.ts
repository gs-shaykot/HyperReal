import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const formData = await req.formData();
    const tran_id = formData.get("tran_id") as string;

    if (tran_id) {
        await prisma.payment.updateMany({
            where: { orderId: tran_id },
            data: { status: "FAILED" },
        });
    }

    return NextResponse.redirect(`${process.env.BASE_URL}/cancel`);
}