
import { generateCustomId } from "@/lib/order_helpers/generateCustomId";
import prisma from "@/lib/prisma";
import {
    OrderStatus,
    PaymentStatus,
    Prisma,
} from "@prisma/client";

export async function generatePaymentTrxId() {
    let transactionId = generateCustomId("HYP-PAY");

    while (
        await prisma.payment.findUnique({
            where: {
                transactionId,
            },
        })
    ) {
        transactionId = generateCustomId("HYP-PAY");
    }

    return transactionId;
}

type CompletePaymentType = Prisma.OrderGetPayload<{
    select: {
        id: true;
        userId: true;
        orderItems: {
            select: {
                quantity: true;
                variantId: true;
            };
        };
        payments: {
            select: {
                status: true;
                couponCode: true;
            };
        };
    };
}>;


export async function completePayment(
    order: CompletePaymentType,
    stripeDetails?: {
        paymentIntentId?: string;
        stripeChargeId?: string;
        cardBrand?: string;
        last4?: string;
        receiptUrl?: string;
    },
    paymentMethod?: string
) {
    const payment = order.payments[0];

    if (!payment) {
        throw new Error(`No payment found for order ${order.id}`);
    }

    const cart = await prisma.cart.findFirst({
        where: {
            userId: order.userId,
        },
    });

    const transactionId = await generatePaymentTrxId();

    await prisma.$transaction(async (tx) => {
        const claimedOrder = await tx.order.updateMany({
            where: {
                id: order.id,
                status: OrderStatus.PENDING,
            },
            data: {
                status: OrderStatus.PROCESSING,
            },
        });

        if (claimedOrder.count === 0) {
            return;
        }

        const updatedPayment = await tx.payment.updateMany({
            where: {
                orderId: order.id,
                status: {
                    not: PaymentStatus.SUCCESS,
                },
            },
            data: {
                status:
                    paymentMethod === "COD"
                        ? PaymentStatus.PENDING
                        : PaymentStatus.SUCCESS,

                transactionId,

                ...(stripeDetails?.paymentIntentId && {
                    paymentIntentId: stripeDetails.paymentIntentId,
                }),

                ...(stripeDetails?.stripeChargeId && {
                    stripeChargeId: stripeDetails.stripeChargeId,
                }),

                ...(stripeDetails?.cardBrand && {
                    cardBrand: stripeDetails.cardBrand,
                }),

                ...(stripeDetails?.last4 && {
                    last4: stripeDetails.last4,
                }),

                ...(stripeDetails?.receiptUrl && {
                    receiptUrl: stripeDetails.receiptUrl,
                }),
            },
        });

        if (updatedPayment.count === 0) {
            throw new Error(
                `Could not update payment for order ${order.id}`
            );
        }

        for (const item of order.orderItems) {
            const updatedStock = await tx.productVariant.updateMany({
                where: {
                    id: item.variantId,
                    stock: {
                        gte: item.quantity,
                    }
                },
                data: {
                    stock: {
                        decrement: item.quantity,
                    },
                },
            });

            if (updatedStock.count !== 1) {
                throw new Error(
                    `Insufficient stock or variant not found: ${item.variantId}`
                );
            }
        }



        if (cart) {
            await tx.cartItem.deleteMany({
                where: {
                    cartId: cart.id,
                },
            });
        }

        if (payment.couponCode) {
            await tx.coupon.update({
                where: {
                    code: payment.couponCode,
                },
                data: {
                    usedCount: {
                        increment: 1,
                    },
                },
            });
        }

        await tx.user.updateMany({
            where: {
                id: order.userId,
                isNewUser: true,
            },
            data: {
                isNewUser: false,
            },
        });
    });
}


export async function markPaymentFailed(orderId: string) {
    await prisma.payment.updateMany({
        where: {
            orderId,
        },
        data: {
            status: PaymentStatus.FAILED,
        },
    });
}
