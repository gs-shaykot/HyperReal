// CREATE ORDER:

import { authOptions } from "@/lib/auth";
import { calculateOrder } from "@/lib/service/orderService";
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
        
        return NextResponse.json({ success: true, data: { subTotal, OrderedItem, finalTotal } });
    }
    catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ success: false, message: "Failed to create order" }, { status: 500 });
    }
}