import prisma from "@/lib/prisma";
import { completePayment } from "@/lib/service/paymentService";
import axios from "axios";
import { NextResponse } from "next/server";

function redirectToPage(path: string) {
    return NextResponse.redirect(new URL(path, process.env.BASE_URL), 303);
}

function logValidationFailure(reason: string, details: Record<string, unknown> = {}) {
    console.error("[sslcommerz:success-validation]", { reason, ...details });
}

export async function POST(req: Request) {
    try {

        const formData = await req.formData();
        const tran_id = formData.get("tran_id") as string;
        const val_id = formData.get("val_id") as string;

        if (!tran_id || !val_id) {
            logValidationFailure("missing_callback_fields", { hasTranId: Boolean(tran_id), hasValId: Boolean(val_id) });
            return redirectToPage("/failed");
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
            logValidationFailure("order_not_found", { tran_id });
            return redirectToPage("/failed");
        }

        if (
            validationData.APIConnect !== "DONE" ||
            !["VALID", "VALIDATED"].includes(validationData.status)
        ) {
            logValidationFailure("gateway_validation_not_successful", { orderCode: order.orderCode, apiConnect: validationData.APIConnect, gatewayStatus: validationData.status });
            return redirectToPage(`/failed?orderId=${order.id}`);
        }

        if (validationData.tran_id !== order.orderCode) {
            logValidationFailure("transaction_id_mismatch", { orderCode: order.orderCode, validatedTranId: validationData.tran_id });
            return redirectToPage(`/failed?orderId=${order.id}`);
        }

        const validatedCurrency = validationData.currency ?? validationData.currency_type;
        if (validatedCurrency !== "BDT") {
            logValidationFailure("currency_mismatch", { orderCode: order.orderCode, validatedCurrency, currency: validationData.currency, currencyType: validationData.currency_type });
            return redirectToPage(`/failed?orderId=${order.id}`);
        }

        const payment = order.payments[0];

        if (!payment || payment.method !== "SSLC" || !payment.sslSessionKey) {
            logValidationFailure("saved_payment_or_session_missing", { orderCode: order.orderCode, paymentFound: Boolean(payment), paymentMethod: payment?.method, savedSessionKeyPresent: Boolean(payment?.sslSessionKey) });
            return redirectToPage(`/failed?orderId=${order.id}`);
        }

        // The validationserverAPI.php response is authoritative for the val_id,
        // transaction ID, amount and currency, but it does not reliably include
        // the sessionkey returned by the initial gateway-session API. Do not
        // reject a valid payment because that optional field is absent.
        if (validationData.val_id && validationData.val_id !== val_id) {
            logValidationFailure("validation_id_mismatch", { orderCode: order.orderCode });
            return redirectToPage(`/failed?orderId=${order.id}`);
        }

        if (payment.status === "SUCCESS" && order.status === "PROCESSING") {
            return redirectToPage(`/success?orderId=${order.id}`);
        }

        // A late success callback must never resurrect a reservation already
        // released after a confirmed gateway failure/cancellation.
        if (payment.status !== "PENDING" || order.status !== "PENDING") {
            logValidationFailure("unexpected_persisted_state", { orderCode: order.orderCode, orderStatus: order.status, paymentStatus: payment.status });
            return redirectToPage(`/failed?orderId=${order.id}`);
        } 

        const validationAmount = Number(validationData.amount).toFixed(2);
        const paidAmount = Number(payment.paidAmountInBDT).toFixed(2);

        if (validationAmount !== paidAmount) {
            logValidationFailure("amount_mismatch", { orderCode: order.orderCode, validationAmount, paidAmount });
            return redirectToPage(`/failed?orderId=${order.id}`);
        }

        const completed = await completePayment(order);
        if (completed) {
            return redirectToPage(`/success?orderId=${order.id}`);
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
            return redirectToPage(`/success?orderId=${order.id}`);
        }

        logValidationFailure("payment_transition_not_persisted", { orderId: order.id, orderCode: order.orderCode });
        return redirectToPage(`/failed?orderId=${order.id}`);

    } catch (error: unknown) {
        console.error("[sslcommerz:success-callback-error]", { errorName: error instanceof Error ? error.name : "UnknownError", errorMessage: error instanceof Error ? error.message : String(error) });
        return redirectToPage("/failed");
    }
}