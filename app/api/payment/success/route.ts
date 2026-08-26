import prisma from "@/lib/prisma";
import { completePayment, markPaymentFailed } from "@/lib/service/paymentService";
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
            select: {
                id: true,
                userId: true,
                orderCode: true,
                orderItems: {
                    select: {
                        quantity: true,
                        variantId: true,
                    },
                },
                payments: {
                    select: {
                        paidAmountInBDT: true,
                        couponCode: true,
                        status: true,
                    },
                },
            },
        });

        if (!order) {
            return NextResponse.redirect(`${process.env.BASE_URL}/failed`);
        }

        if (validationData.status !== "VALID" ) {
            await markPaymentFailed(order.id);

            return NextResponse.redirect(
                `${process.env.BASE_URL}/failed`
            );
        }

        if (validationData.tran_id !== order.orderCode) {
            await markPaymentFailed(order.id);
            return NextResponse.redirect(`${process.env.BASE_URL}/failed`);
        }

        if (validationData.currency !== "BDT") {
            await markPaymentFailed(order.id);
            return NextResponse.redirect(`${process.env.BASE_URL}/failed`);
        }

        const payment = order.payments[0];

        if (!payment) {
            return NextResponse.redirect(`${process.env.BASE_URL}/failed`);
        }

        if (payment.status === "SUCCESS") {
            return NextResponse.redirect(`${process.env.BASE_URL}/success?orderId=${order.id}`);
        } 

        const validationAmount = Number(validationData.amount).toFixed(2);
        const paidAmount = Number(payment.paidAmountInBDT).toFixed(2);

        if (validationAmount !== paidAmount) {
            await markPaymentFailed(order.id);
            return NextResponse.redirect(`${process.env.BASE_URL}/failed`);
        }

        await completePayment(order);

        return NextResponse.redirect(`${process.env.BASE_URL}/success?orderId=${order.id}`);

    } catch (error: unknown) {
        console.error("[payment/success] Payment Validation Error:", error);
        return NextResponse.redirect(`${process.env.BASE_URL}/failed`);
    }
}