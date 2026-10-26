export type FulfillmentTab =
    | "ALL"
    | "READY_TO_PACK"
    | "PACKING"
    | "PACKED"
    | "DISPATCHED";

export type FulfillmentStatus =
    | "READY_TO_PACK"
    | "PACKING"
    | "PACKED"
    | "DISPATCHED";

export type ShipmentStatus =
    | "PENDING"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "FAILED";

export type PaymentMethod = "STRIPE" | "COD" | "SSLC";
export type PaymentStatus = "SUCCESS" | "FAILED" | "PENDING";

export type ItemCheck = {
    id: string;
    orderItemId: string;
    verified: boolean;
    verifiedAt: string | null;
    verifiedBy: string | null;
};

export type TrackingEvent = {
    id: string;
    type: string;
    title: string;
    description: string | null;
    location?: string | null;
    createdAt: string;
    actor?: { id: string; name: string | null } | null;
};

export type Shipment = {
    id: string;
    orderId: string;
    trackingCode: string;
    fulfillmentStatus: FulfillmentStatus;
    status: ShipmentStatus;
    parcelTokenHash?: string | null;
    assignedCourier?: {
        id: string;
        name: string | null;
        email: string;
        phone: string | null;
    } | null;
    itemChecks: ItemCheck[];
    events: TrackingEvent[];
    packedAt?: string | null;
    dispatchedAt?: string | null;
    deliveredAt?: string | null;
    createdAt: string;
};

export type OrderItem = {
    id: string;
    quantity: number;
    priceAtPurchase: number | string;
    variant: {
        id: string;
        size: string | null;
        color: string | null;
        product: { id: string; name: string };
    };
};

export type Payment = {
    id: string;
    method: PaymentMethod;
    status: PaymentStatus;
    country: string | null;
    paidAmountInUSD: number | string | null;
    paidAmountInBDT: number | string | null;
    totalProductPriceInUSD: number | string | null;
    shippingCost: number | string | null;
    shippingMethod: string | null;
    transactionId: string | null;
};

export type ShippingAddress = {
    fullName: string;
    street: string;
    city: string;
    house: string | null;
    zipCode: string;
    country: string;
    phone: string;
};

export type Order = {
    id: string;
    orderCode: string;
    status: string;
    createdAt: string;
    user: {
        id: string;
        name: string | null;
        email: string;
        phone: string | null;
    };
    orderHistory: ShippingAddress | null;
    orderItems: OrderItem[];
    payments: Payment[];
    shipment: Shipment | null;
};

export type FulfillmentStats = {
    readyToPack: number;
    packing: number;
    packed: number;
    awaitingDispatch: number;
    outForDelivery: number;
    delivered: number;
    failed: number;
    ordersByStatus: { status: string; count: number }[];
};

export type FulfillmentResponse = {
    orders: Order[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
    stats: FulfillmentStats;
};

export type ApiResponse<T> = {
    success: boolean;
    message?: string;
    data: T;
};

export type ScanResult = {
    shipment: {
        id: string;
        fulfillmentStatus: FulfillmentStatus;
        status: ShipmentStatus;
    } | null;
    trackingCode: string | null;
    order: { id: string; orderCode: string };
};

export type ModalName = "scan" | "label" | "details" | null;
export type DetailTab = "items" | "timeline";

export type BarcodeDetectorResult = {
    rawValue: string;
    format: string;
};

export type BarcodeDetectorInstance = {
    detect: (source: HTMLVideoElement) => Promise<BarcodeDetectorResult[]>;
};

export type BarcodeDetectorConstructor = new (options?: {
    formats?: string[];
}) => BarcodeDetectorInstance;

declare global {
    interface Window {
        BarcodeDetector?: BarcodeDetectorConstructor;
    }
}

