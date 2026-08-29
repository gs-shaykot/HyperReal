import { CartItemWithProductType } from "@/app/types/cartType";
import { authOptions } from "@/lib/auth";
import { getDiscount } from "@/lib/Discount_Calculation_funcs";
import { CouponError } from "@/lib/errors/CouponError";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function calculateOrder(cartItems: CartItemWithProductType[], country: string, coupon?: string, deliveryOption?: string) {

    const session = await getServerSession(authOptions);

    const variantIds = cartItems.map(item => item.variantId);

    const variants = await prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: { product: true }
    });

    const DeliveryOptions = [
        {
            label: "Standard Drop",
            cost: country === 'bdt' ? 1.2 : 15,
            estimatedDelivery: country === 'bdt' ? "3-5" : "10-15",
        },
        {
            label: "Express Drop",
            cost: country === 'bdt' ? 2.5 : 30,
            estimatedDelivery: country === 'bdt' ? "1-2" : "5-7",
        }
    ]

    let subTotal = 0;

    const OrderedItem = cartItems.map(item => {
        const variant = variants.find(v => v.id === item.variantId);
        if (!variant) {
            throw new Error('Variant not found');
        }
        if (variant.stock < item.quantity) {
            throw new Error('Insufficient stock');
        }
        if (item.quantity <= 0) {
            throw new Error('Invalid quantity');
        }

        const productPrice = variant.product.price;
        subTotal += productPrice * item.quantity;

        return {
            variantId: item.variantId,
            quantity: item.quantity,
            price: productPrice,
        }
    });

    const shippingCost = deliveryOption ? DeliveryOptions.find(option => option.label === deliveryOption)?.cost || 0 : 0;
    let discount = 0;

    if (coupon) {
        const Appliedcoupon = await prisma.coupon.findUnique({
            where: { code: coupon }
        });

        if (!Appliedcoupon) {
            throw new CouponError("Invalid coupon code");
        }

        if (Appliedcoupon.expiryDate && Appliedcoupon.expiryDate < new Date()) {
            throw new CouponError('This coupon has expired');
        }

        if (Appliedcoupon.newUserOnly && session?.user?.isNewUser !== true) {
            throw new CouponError('This coupon is only available for new users');
        }

        if (Appliedcoupon.limit !== null && Appliedcoupon.usedCount >= Appliedcoupon.limit) {
            throw new CouponError('This coupon has reached its usage limit');
        }

        if (Appliedcoupon.minSpend !== null && subTotal < Appliedcoupon.minSpend) {
            throw new CouponError(`Minimum purchase of $${Appliedcoupon.minSpend} is required for this coupon`);
        }

        discount = getDiscount(Appliedcoupon, subTotal, session?.user?.isNewUser === true);

    }

    const USD_finalTotal = subTotal + shippingCost - discount;

    return { USD_finalTotal, subTotal, discount, shippingCost }
}