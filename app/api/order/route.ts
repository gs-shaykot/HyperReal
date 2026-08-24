import { CartItemWithProductType } from "@/app/types/cartType";
import { authOptions } from "@/lib/auth";
import { generateCustomId } from "@/lib/generateCustomId";
import prisma from "@/lib/prisma";
import { cartItemsSelect } from "@/lib/prisma/cartItemsSelect";
import { calculateOrder } from "@/lib/service/orderService";
import { completePayment } from "@/lib/service/paymentService";
import { stripe } from "@/lib/stripe";
import axios from "axios";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        // Parsing requested body: 
        const body = await req.json(); 
        const { country, coupon, paymentMethod, address, saveAddress, deliveryOption } = body;

        const cart = await prisma.cart.findUnique({
            where: {
                userId: session.user.id,
            },
            select: cartItemsSelect,
        });

        if (!cart || cart.cartItems.length === 0) {
            return NextResponse.json(
                { success: false, message: "Cart is empty" },
                { status: 400 }
            );
        }

        const cartItems = cart.cartItems;
        
        // Calculating Order total & others: 
        const { label, fullName, street, city, house, zipCode, phone } = address;
        const { USD_finalTotal, subTotal, discount, shippingCost } = await calculateOrder(cartItems, country.value, coupon, deliveryOption);

        // Generating unique order code: 
        let orderCode = generateCustomId("HYP-ORD");
        while (await prisma.order.findUnique({ where: { orderCode } })) {
            orderCode = generateCustomId("HYP-ORD");
        }

        // Converting currency:
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
                            country: country.shortName,
                            shippingMethod: deliveryOption,
                            couponCode: coupon || null
                        }
                    }
                },
                include: {
                    orderItems: {
                        select: {
                            variantId: true,
                            quantity: true,
                        }
                    },
                    payments: {
                        select: {
                            status: true,
                            couponCode: true,
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

            return order;
        });


        switch (paymentMethod) {
            case "SSLC": {
                const tran_id = order.orderCode;
                const orderId = order.id;
                
                const sslData = {
                    store_id: process.env.SSLC_STORE_ID,
                    store_passwd: process.env.SSLC_STORE_PASSWORD,
                    total_amount: finalTotal,
                    currency: "BDT",
                    tran_id, 
                    orderId,
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

            case "STRIPE": {
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: Math.round(USD_finalTotal * 100),
                    currency: "usd",
                    payment_method_types: ["card"],

                    metadata: {
                        orderId: order.id,
                        orderCode: order.orderCode,
                        userId: session.user.id,
                    },
                });

                await prisma.payment.updateMany({
                    where: {
                        orderId: order.id,
                    },
                    data: {
                        paymentIntentId: paymentIntent.id,
                    },
                });

                return NextResponse.json({
                    success: true,
                    orderId: order.id,
                    clientSecret:
                        paymentIntent.client_secret,
                });
            }
            case "COD": {
                await completePayment(order, undefined, "COD");
                break;
            }

        }

        return NextResponse.json({ success: true, message: "Order created successfully", orderId: order.id });
    }
    catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ success: false, message: "Failed to create order" }, { status: 500 });
    }
}