import { generateCustomId } from "@/lib/generateCustomId";
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

        const order = await prisma.order.findUnique({
            where: { orderCode: tran_id },
        });


        if (!order) {
            return NextResponse.redirect(`${process.env.BASE_URL}/failed`);
        }

        if (validationData.status !== "VALID") {
            await prisma.payment.updateMany({
                where: { orderId: order.id },
                data: { status: "FAILED" }
            })

            return NextResponse.redirect(`${process.env.BASE_URL}/failed`);
        }


        if (Number(validationData.amount).toFixed(2) !== Number(order.totalAmount).toFixed(2)) {
            console.log("Validation Amount: ", validationData.amount, " ", "", "Order Amount: ", order.totalAmount);
            await prisma.payment.updateMany({
                where: { orderId: order.id },
                data: { status: "FAILED" }
            })

            return NextResponse.redirect(`${process.env.BASE_URL}/failed`);
        }

        let transactionId = generateCustomId("HYP-PAY");

        while (await prisma.payment.findUnique({ where: { transactionId } })) {
            transactionId = generateCustomId("HYP-PAY");
        }

        await prisma.payment.updateMany({
            where: { orderId: order.id },
            data: {
                status: "SUCCESS",
                transactionId
            }
        });

        await prisma.order.update({
            where: { id: order.id },
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