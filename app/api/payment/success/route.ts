import prisma from "@/lib/prisma";
import { completePayment } from "@/lib/service/paymentService";
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

        const validatorBaseUrl = process.env.SSLCOMMERZ_VALIDATOR_BASE_URL || "https://sandbox.sslcommerz.com";
        const validationUrl = `${validatorBaseUrl}/validator/api/validationserverAPI.php?val_id=${encodeURIComponent(val_id)}&store_id=${encodeURIComponent(process.env.SSLC_STORE_ID || "")}&store_passwd=${encodeURIComponent(process.env.SSLC_STORE_PASSWORD || "")}&format=json`;

        const validationRes = await axios.get(validationUrl);
        const validationData = validationRes.data;

        const order = await prisma.order.findUnique({
            where: { orderCode: tran_id },
            select: {
                id: true,
                userId: true,
                orderCode: true,
                status: true,
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
                        method: true,
                        sslSessionKey: true,
                    },
                },
            },
        });

        if (!order) {
            return NextResponse.redirect(`${process.env.BASE_URL}/failed`);
        }

        if (
            validationData.APIConnect !== "DONE" ||
            !["VALID", "VALIDATED"].includes(validationData.status)
        ) {
            return NextResponse.redirect(`${process.env.BASE_URL}/failed?orderId=${order.id}`);
        }

        if (validationData.tran_id !== order.orderCode) {
            return NextResponse.redirect(`${process.env.BASE_URL}/failed?orderId=${order.id}`);
        }

        const validatedCurrency = validationData.currency ?? validationData.currency_type;
        if (validatedCurrency !== "BDT") {
            return NextResponse.redirect(`${process.env.BASE_URL}/failed?orderId=${order.id}`);
        }

        const payment = order.payments[0];

        if (!payment || payment.method !== "SSLC" || !payment.sslSessionKey) {
            return NextResponse.redirect(`${process.env.BASE_URL}/failed?orderId=${order.id}`);
        }

        // Bind the validated transaction to the exact SSLCommerz session created
        // for this order; a valid transaction ID alone is not sufficient.
        if (validationData.sessionkey !== payment.sslSessionKey) {
            return NextResponse.redirect(`${process.env.BASE_URL}/failed?orderId=${order.id}`);
        }

        if (payment.status === "SUCCESS" && order.status === "PROCESSING") {
            return NextResponse.redirect(`${process.env.BASE_URL}/success?orderId=${order.id}`);
        }

        // A late success callback must never resurrect a reservation already
        // released after a confirmed gateway failure/cancellation.
        if (payment.status !== "PENDING" || order.status !== "PENDING") {
            return NextResponse.redirect(`${process.env.BASE_URL}/failed?orderId=${order.id}`);
        } 

        const validationAmount = Number(validationData.amount).toFixed(2);
        const paidAmount = Number(payment.paidAmountInBDT).toFixed(2);

        if (validationAmount !== paidAmount) {
            return NextResponse.redirect(`${process.env.BASE_URL}/failed?orderId=${order.id}`);
        }

        const completed = await completePayment(order);
        if (completed) {
            return NextResponse.redirect(`${process.env.BASE_URL}/success?orderId=${order.id}`);
        }

        // Another callback may have completed the order concurrently. Confirm
        // persisted state rather than assuming the transition succeeded.
        const latest = await prisma.order.findUnique({
            where: { id: order.id },
            select: {
                status: true,
                payments: { select: { status: true, method: true } },
            },
        });

        if (latest?.status === "PROCESSING" && latest.payments[0]?.status === "SUCCESS") {
            return NextResponse.redirect(`${process.env.BASE_URL}/success?orderId=${order.id}`);
        }

        return NextResponse.redirect(`${process.env.BASE_URL}/failed?orderId=${order.id}`);

    } catch (error: unknown) {
        return NextResponse.redirect(`${process.env.BASE_URL}/failed`);
    }
}