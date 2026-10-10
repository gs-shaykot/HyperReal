export type OrderProduct = {
    id: string;
    orderCode: string;
    status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    createdAt: string | Date;

    user: {
        id: string;
        name: string;
        email: string;
    }

    orderItems: {
        id: string;
        quantity: number;
        priceAtPurchase: number;

        variant: {
            size: string;
            color: string;

            product: {
                id: string;
                name: string;
            }
        }
    }[];

    payments: {
        id: string;
        status: "PENDING" | "SUCCESS" | "FAILED";
        paidAmountInUSD: number;
        totalProductPriceInUSD: number;
        discount: number;
        shippingCost: number;
        method: string;
        country: string;
    }[]

    orderHistory: {
        fullName: string;
        phone: string;
        street: string;
        city: string;
        house: string;
        zipCode: string;
        country: string;
    } | null;
}