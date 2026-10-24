
import {
    FulfillmentStatus,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
    Prisma,
    ShipmentStatus,
} from "@prisma/client";

import prisma from "@/lib/prisma";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

export type FulfillmentFilter =
    | "ALL"
    | FulfillmentStatus
    | "DISPATCHED";

export interface GetAdminFulfillmentParams {
    search?: string;
    filter?: FulfillmentFilter;
    page?: number;
    pageSize?: number;
}

const eligibleOrderWhere: Prisma.OrderWhereInput = {
    status: {
        in: [
            OrderStatus.PROCESSING,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED,
        ],
    },
    payments: {
        some: {
            OR: [
                { method: PaymentMethod.COD },
                { status: PaymentStatus.SUCCESS },
            ],
        },
    },
};

function buildSearchWhere(search: string): Prisma.OrderWhereInput {
    const query = search.trim();

    if (!query) {
        return {};
    }

    return {
        OR: [
            {
                orderCode: {
                    contains: query,
                    mode: "insensitive",
                },
            },
            {
                user: {
                    name: {
                        contains: query,
                        mode: "insensitive",
                    },
                },
            },
            {
                user: {
                    email: {
                        contains: query,
                        mode: "insensitive",
                    },
                },
            },
            {
                shipment: {
                    is: {
                        trackingCode: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                },
            },
        ],
    };
}

function buildFilterWhere(
    filter: FulfillmentFilter,
): Prisma.OrderWhereInput {
    if (filter === "ALL") {
        return {};
    }

    if (filter === "DISPATCHED") {
        return {
            shipment: {
                is: {
                    fulfillmentStatus: FulfillmentStatus.DISPATCHED,
                },
            },
        };
    }

    return {
        OR: [
            {
                shipment: {
                    is: {
                        fulfillmentStatus: filter,
                    },
                },
            },
            ...(filter === FulfillmentStatus.READY_TO_PACK
                ? [
                      {
                          shipment: {
                              is: null,
                          },
                      },
                  ]
                : []),
        ],
    };
}

export async function getAdminFulfillment({
    search = "",
    filter = "ALL",
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
}: GetAdminFulfillmentParams = {}) {
    const safePage =
        Number.isFinite(page) && page > 0
            ? Math.floor(page)
            : DEFAULT_PAGE;

    const safePageSize =
        Number.isFinite(pageSize) && pageSize > 0
            ? Math.min(Math.floor(pageSize), MAX_PAGE_SIZE)
            : DEFAULT_PAGE_SIZE;

    const where: Prisma.OrderWhereInput = {
        AND: [
            eligibleOrderWhere,
            buildSearchWhere(search),
            buildFilterWhere(filter),
        ],
    };

    const skip = (safePage - 1) * safePageSize;

    const [orders, total, statusCounts] = await Promise.all([
        prisma.order.findMany({
            where,
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: safePageSize,
            select: {
                id: true,
                orderCode: true,
                status: true,
                createdAt: true,

                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },

                orderHistory: {
                    select: {
                        fullName: true,
                        street: true,
                        city: true,
                        house: true,
                        zipCode: true,
                        country: true,
                        phone: true,
                    },
                },

                orderItems: {
                    select: {
                        id: true,
                        quantity: true,
                        priceAtPurchase: true,
                        variant: {
                            select: {
                                id: true,
                                size: true,
                                color: true,
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },

                payments: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1,
                    select: {
                        id: true,
                        method: true,
                        status: true,
                        country: true,
                        paidAmountInUSD: true,
                        paidAmountInBDT: true,
                        totalProductPriceInUSD: true,
                        shippingCost: true,
                        shippingMethod: true,
                        transactionId: true,
                    },
                },

                shipment: {
                    include: {
                        itemChecks: true,
                        assignedCourier: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                            },
                        },
                        events: {
                            orderBy: {
                                createdAt: "desc",
                            },
                            include: {
                                actor: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }),

        prisma.order.count({ where }),

        // Counts are global dashboard totals, not limited to the current page.
        prisma.order.groupBy({
            by: ["status"],
            where: eligibleOrderWhere,
            _count: {
                _all: true,
            },
        }),
    ]);

    const shipmentCounts = await prisma.shipment.groupBy({
        by: ["fulfillmentStatus"],
        where: {
            order: eligibleOrderWhere,
        },
        _count: {
            _all: true,
        },
    });

    const countFor = (status: FulfillmentStatus) =>
        shipmentCounts.find(
            (entry) => entry.fulfillmentStatus === status,
        )?._count._all ?? 0;

    const ordersWithoutShipment = await prisma.order.count({
        where: {
            AND: [
                eligibleOrderWhere,
                {
                    shipment: {
                        is: null,
                    },
                },
            ],
        },
    });

    const shipmentStatusCounts = await prisma.shipment.groupBy({
        by: ["status"],
        where: {
            order: eligibleOrderWhere,
        },
        _count: {
            _all: true,
        },
    });

    const countShipmentStatus = (status: ShipmentStatus) =>
        shipmentStatusCounts.find(
            (entry) => entry.status === status,
        )?._count._all ?? 0;

    return {
        orders,
        pagination: {
            page: safePage,
            pageSize: safePageSize,
            total,
            totalPages: Math.max(1, Math.ceil(total / safePageSize)),
        },
        stats: {
            readyToPack:
                countFor(FulfillmentStatus.READY_TO_PACK) +
                ordersWithoutShipment,
            packing: countFor(FulfillmentStatus.PACKING),
            packed: countFor(FulfillmentStatus.PACKED),
            awaitingDispatch: countFor(FulfillmentStatus.DISPATCHED),
            outForDelivery: countShipmentStatus(
                ShipmentStatus.OUT_FOR_DELIVERY,
            ),
            delivered: countShipmentStatus(ShipmentStatus.DELIVERED),
            failed: countShipmentStatus(ShipmentStatus.FAILED),
            ordersByStatus: statusCounts.map((entry) => ({
                status: entry.status,
                count: entry._count._all,
            })),
        },
    };
}
