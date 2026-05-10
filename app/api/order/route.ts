// CREATE ORDER:

import { CartItemWithProductType } from "@/app/types/cartType";
import { authOptions } from "@/lib/auth";
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
        const { cartItems, country, coupon, paymentMethod, address } = body;

        const { subTotal, OrderedItem, finalTotal } = await calculateOrder(cartItems, country, coupon);

        const order = await prisma.order.create({
            data: {
                userId: session.user.id,
                totalAmount: finalTotal,
                address: address,
                status: "PENDING",
            }
        });

        const orderItem = await prisma.orderItem.createMany({
            data: cartItems.map((item: CartItemWithProductType) => ({
                orderId: order.id,
                variantId: item.variantId,
                quantity: item.quantity,
                priceAtPurchase: item.variant.product.price,
            }))
        });

        const payment = await prisma.payment.create({
            data: {
                orderId: order.id,
                method: paymentMethod,
                status: "PENDING",
                amount: finalTotal,
            }
        })

        if (paymentMethod === "BKASH") {
            const tran_id = order.id;

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

    }
    catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ success: false, message: "Failed to create order" }, { status: 500 });
    }
}