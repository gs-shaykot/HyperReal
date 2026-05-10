import { CartItemWithProductType } from "@/app/types/cartType";
import { getDiscount } from "@/lib/Discount_Calculation_funcs";
import prisma from "@/lib/prisma";

export async function calculateOrder(cartItems: CartItemWithProductType[], country: string, coupon?: string) { 
    const variantIds = cartItems.map(item => item.variantId);

    const variants = await prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: { product: true }
    });

    let subTotal = 0;
    const OrderedItem = cartItems.map(item => {
        const variant = variants.find(v => v.id === item.variantId);
        if (!variant) {
            throw new Error('Variant not found');
        }
        if (variant.stock < item.quantity) {
            throw new Error('Insufficient stock for');
        }
        if (item.quantity <= 0) {
            throw new Error('Invalid quantity for');
        }

        const productPrice = variant.product.price;
        subTotal += productPrice * item.quantity;

        return {
            variantId: item.variantId,
            quantity: item.quantity,
            price: productPrice,
        }
    }); 
    const shippingCost = country === 'bdt' ? 1.2 : 20;  

    const Appliedcoupon = await prisma.coupon.findUnique({
        where: { code: coupon }
    }); 

    const discount = Appliedcoupon ? getDiscount(Appliedcoupon, subTotal) : 0; 
    const finalTotal = subTotal + shippingCost - discount; 

    return { subTotal, OrderedItem, finalTotal }
}