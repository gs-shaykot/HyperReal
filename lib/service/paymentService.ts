import { generateCustomId } from '@/lib/generateCustomId';
import prisma from '@/lib/prisma';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';


export async function generatePaymentTrxId() {
    let transactionId = generateCustomId("HYP-PAY");

    while (
        await prisma.payment.findUnique(
            {
                where: {
                    transactionId
                }
            }
        )) {
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


export async function completePayment(order: CompletePaymentType) {
    const payment = order.payments[0];

    if (payment.status === PaymentStatus.SUCCESS) {
        return;
    }

    const cart = await prisma.cart.findFirst({
        where: { userId: order.userId },
    });

    const transactionId = await generatePaymentTrxId();

    await prisma.$transaction(async (tx) => {
        await tx.payment.updateMany({
            where: { orderId: order.id },
            data: {
                status: PaymentStatus.SUCCESS,
                transactionId,
            },
        });

        await tx.order.update({
            where: { id: order.id },
            data: {
                status: OrderStatus.PROCESSING,
            },
        });

        for (const item of order.orderItems) {

            const updated = await tx.productVariant.updateMany({
                where: {
                    id: item.variantId,
                },
                data: {
                    stock: {
                        decrement: item.quantity,
                    },
                },
            });
            if (updated.count === 0) {
                throw new Error(`Failed to update stock for variant ${item.variantId}`);
            }
        }

        if (cart) {
            await tx.cartItem.deleteMany({
                where: {
                    cartId: cart?.id,
                },
            });
        }

        if (payment?.couponCode) {
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
    })
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