import { CartItemWithProductType } from "@/app/types/cartType";
import { authOptions } from "@/lib/auth";
import { generateCustomId } from "@/lib/generateCustomId";
import prisma from "@/lib/prisma";
import { calculateOrder } from "@/lib/service/orderService";
import axios from "axios";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { cartItems, country, coupon, paymentMethod, address, saveAddress, deliveryOption } = body;
        console.log("Coupon from request body:", coupon);

        const { label, fullName, street, city, house, zipCode, phone } = address;
        const { USD_finalTotal, subTotal, discount, shippingCost } = await calculateOrder(cartItems, country.value, coupon, deliveryOption);

        let orderCode = generateCustomId("HYP-ORD");

        while (await prisma.order.findUnique({ where: { orderCode } })) {
            orderCode = generateCustomId("HYP-ORD");
        }

        const res = await axios.get('https://open.er-api.com/v6/latest/USD');
        const rates = res.data.rates;
        const finalTotal = country.value === 'bdt' ? USD_finalTotal * rates.BDT : USD_finalTotal;

        if (saveAddress) {
            const addressCount = await prisma.address.count({
                where: {
                    userId: session.user.id
                }
            });
            if (addressCount >= 10) {
                return NextResponse.json({ success: false, message: "Address limit reached. You can save up to 10 addresses." }, { status: 400 });
            }
        }

        const order = await prisma.$transaction(async (tx) => {

            const order = await tx.order.create({
                data: {
                    userId: session.user.id,
                    status: "PENDING",
                    orderCode,
                    orderHistory: {
                        create: {
                            fullName,
                            street,
                            city,
                            house,
                            zipCode,
                            country: country.name,
                            phone,
                        }
                    },
                    orderItems: {
                        create: cartItems.map((item: CartItemWithProductType) => ({
                            variantId: item.variantId,
                            quantity: item.quantity,
                            priceAtPurchase: item.variant.product.price,
                        }))
                    },
                    payments: {
                        create: {
                            method: paymentMethod,
                            status: "PENDING",
                            paidAmountInBDT: finalTotal,
                            totalProductPriceInUSD: subTotal,
                            discount: discount,
                            shippingCost: shippingCost,
                            country: country.shortName
                        }
                    }
                }
            });

            saveAddress && await tx.address.create({
                data: {
                    userId: session.user.id,
                    label,
                    fullName,
                    street,
                    city,
                    house,
                    zipCode,
                    country: country.name,
                    phone
                }
            });

            await tx.user.updateMany({
                where: {
                    id: session.user.id,
                    isNewUser: true
                },
                data: {
                    isNewUser: false
                }
            });

            await tx.coupon.update({
                where: {
                    code: coupon
                },
                data: {
                    usedCount: {
                        increment: 1
                    }
                }
            });

            return order;
        });

        if (paymentMethod === "SSLC") {
            const tran_id = order.orderCode;

            const sslData = {
                store_id: process.env.SSLC_STORE_ID,
                store_passwd: process.env.SSLC_STORE_PASSWORD,
                total_amount: finalTotal,
                currency: "BDT",
                tran_id,
                success_url: `${process.env.BASE_URL}/api/payment/success`,
                fail_url: `${process.env.BASE_URL}/api/payment/fail`,
                cancel_url: `${process.env.BASE_URL}/api/payment/cancel`,
                product_name: "Order Payment",
                product_category: "Ecommerce",
                product_profile: "general",
            };

            const response = await axios.post(
                "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
                new URLSearchParams(sslData as any),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            const data = response.data;

            return NextResponse.json({ success: true, paymentUrl: data.GatewayPageURL });
        }

        return NextResponse.json({ success: true, message: "Order created successfully", orderId: order.id });
    }
    catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ success: false, message: "Failed to create order" }, { status: 500 });
    }
}