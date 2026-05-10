import prisma from "@/lib/prisma";
import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const tran_id = formData.get("tran_id") as string;
        const val_id = formData.get("val_id") as string;

        if (!tran_id || !val_id) {
            return NextResponse.redirect(`${process.env.BASE_URL}/failed`);
        }

        const validationUrl = `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${process.env.SSLC_STORE_ID}&store_passwd=${process.env.SSLC_STORE_PASSWORD}&format=json`;
        const validationRes = await axios.get(validationUrl);
        const validationData = validationRes.data;

        if (validationData.status !== "VALID") {
            await prisma.payment.updateMany({
                where: { orderId: tran_id },
                data: { status: "FAILED" }
            })

            return NextResponse.redirect(`${process.env.BASE_URL}/failed`);
        }

        const order = await prisma.order.findUnique({
            where: { id: tran_id },
        });

        if (!order) {
            return NextResponse.redirect(`${process.env.BASE_URL}/failed`);
        }

        if (Number(validationData.amount) !== order.totalAmount) {
            await prisma.payment.updateMany({
                where: { orderId: tran_id },
                data: { status: "FAILED" }
            })

            return NextResponse.redirect(`${process.env.BASE_URL}/failed`);
        }

        await prisma.payment.updateMany({
            where: { orderId: tran_id },
            data: {
                status: "SUCCESS",
                transactionId: validationData.tran_id
            }
        });

        await prisma.order.update({
            where: { id: tran_id },
            data: {
                status: "PROCESSING"
            }
        });

        return NextResponse.redirect(`${process.env.BASE_URL}/success`);

    }
    catch (error: unknown) {
        console.error("Payment Validation Error:", error);
        return NextResponse.redirect(`${process.env.BASE_URL}/failed`);
    }
}