import { CartItemWithProductType } from "@/app/types/cartType";
import { authOptions } from "@/lib/auth";
import { CouponError } from "@/lib/errors/CouponError";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { getCouponValidationError, getDiscount } from "@/lib/order_helpers/Discount_Calculation_funcs";

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
        const normalizedCode = coupon.trim().toUpperCase();

        if (!normalizedCode) {
            throw new CouponError("Invalid coupon code.");
        }

        const [appliedCoupon, user] = await Promise.all([
            prisma.coupon.findUnique({
                where: { code: normalizedCode },
            }),
            session?.user?.id
                ? prisma.user.findUnique({
                    where: { id: session.user.id },
                    select: {
                        isNewUser: true,
                        isBlocked: true,
                    },
                })
                : Promise.resolve(null),
        ]);

        if (!appliedCoupon) {
            throw new CouponError("Invalid coupon code.");
        }

        if (!user || user.isBlocked) {
            throw new CouponError(
                "Your account is not authorized to use this coupon."
            );
        }

        const validationError = getCouponValidationError(
            appliedCoupon,
            subTotal,
            user.isNewUser
        );

        if (validationError) {
            throw new CouponError(validationError);
        }

        discount = getDiscount(
            appliedCoupon,
            subTotal,
            user.isNewUser
        );
    };

    const USD_finalTotal = subTotal + shippingCost - discount;

    return { USD_finalTotal, subTotal, discount, shippingCost }
}