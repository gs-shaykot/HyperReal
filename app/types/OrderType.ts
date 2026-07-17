import { product } from './Product';

export type OrderType = {
    id?: string;
    userId?: string;
    status?: string;
    orderCode?: string;
    createdAt?: Date;
    address?: string;

    orderItems: OrderItemType[];
    payments: PaymentType[];
}

export type OrderItemType = {
    id?: string;
    variantId?: string;
    quantity?: number;
    priceAtPurchase?: number;

    variant?: VariantType;
}

export type VariantType = {
    id?: string;
    productId?: string;
    size?: string;
    color?: string;
    stock?: number;

    product?: ProductTypeWithCategory;
}

export type categoryType = {
    name?: string;
}

export type PaymentType = {
    id?: string;
    orderId?: string;
    method?: string;
    country?: string;
    status?: string;
    transactionId?: string;
    paidAmountInBDT?: number;
    totalProductPriceInUSD?: number;
    discount?: number;
    shippingCost?: number;
    createdAt?: Date;
}

export type ProductTypeWithCategory = product & {
    category?: categoryType;
}