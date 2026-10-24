
import {
    FulfillmentStatus,
    Prisma,
} from "@prisma/client";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
    dispatchShipment,
    ensureShipmentForOrder,
    markShipmentPacked,
    rotateParcelToken,
    startPacking,
    TrackingError,
    verifyShipmentItem,
} from "@/lib/service/trackingService";
import {
    getAdminFulfillment,
    type FulfillmentFilter,
} from "@/utils/AdminUtils/getAdminFulfillment";

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type AdminSessionUser = {
    id: string;
    role: string;
};

type ActionBody = {
    action?: unknown;
    orderId?: unknown;
    shipmentId?: unknown;
    orderItemId?: unknown;
};

const allowedFilters = new Set<string>([
    "ALL",
    ...Object.values(FulfillmentStatus),
    "DISPATCHED",
]);

async function getAdmin(): Promise<AdminSessionUser | null> {
    const session = await getServerSession(authOptions);
    console.log("Admin session:", session);
    if (
        !session?.user?.id ||
        session.user.role !== "ADMIN"
    ) {
        return null;
    }

    return {
        id: session.user.id,
        role: session.user.role,
    };
}

function errorResponse(error: unknown) {
    if (error instanceof TrackingError) {
        return NextResponse.json(
            {
                success: false,
                message: error.message,
            },
            { status: error.statusCode },
        );
    }

    if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
    ) {
        return NextResponse.json(
            {
                success: false,
                message: "The requested record was not found.",
            },
            { status: 404 },
        );
    }

    console.error("Admin fulfillment API error:", error);

    return NextResponse.json(
        {
            success: false,
            message: "The fulfillment request could not be completed.",
        },
        { status: 500 },
    );
}

function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

export async function GET(request: Request) {
    try {
        const admin = await getAdmin();

        if (!admin) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 },
            );
        }

        const { searchParams } = new URL(request.url);

        const search = searchParams.get("search") ?? "";
        const rawFilter = searchParams.get("filter") ?? "ALL";
        const rawPage = Number(searchParams.get("page") ?? "1");
        const rawPageSize = Number(
            searchParams.get("pageSize") ?? "10",
        );

        if (!allowedFilters.has(rawFilter)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid fulfillment filter.",
                },
                { status: 400 },
            );
        }

        const data = await getAdminFulfillment({
            search,
            filter: rawFilter as FulfillmentFilter,
            page: Number.isFinite(rawPage) ? rawPage : 1,
            pageSize: Number.isFinite(rawPageSize) ? rawPageSize : 10,
        });

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        return errorResponse(error);
    }
}

export async function POST(request: Request) {
    try {
        const admin = await getAdmin();

        if (!admin) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 },
            );
        }

        let body: ActionBody;

        try {
            body = (await request.json()) as ActionBody;
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid JSON body." },
                { status: 400 },
            );
        }

        if (!isNonEmptyString(body.action)) {
            return NextResponse.json(
                { success: false, message: "An action is required." },
                { status: 400 },
            );
        }

        switch (body.action) {
            case "CREATE_SHIPMENT": {
                if (!isNonEmptyString(body.orderId)) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: "A valid order ID is required.",
                        },
                        { status: 400 },
                    );
                }

                const shipment = await ensureShipmentForOrder(
                    body.orderId.trim(),
                );

                // Do not expose or rotate an existing token during a normal
                // refresh or repeat create-shipment request.
                const storedToken = await prisma.shipment.findUnique({
                    where: { id: shipment.id },
                    select: { parcelTokenHash: true },
                });

                let parcelToken: string | null = null;

                if (!storedToken?.parcelTokenHash) {
                    const generated = await rotateParcelToken(shipment.id);
                    parcelToken = generated.token;
                }

                return NextResponse.json({
                    success: true,
                    message: parcelToken
                        ? "Shipment created and parcel token generated."
                        : "Shipment is ready.",
                    data: {
                        shipment,
                        parcelToken,
                    },
                });
            }

            case "START_PACKING":
            case "VERIFY_ITEM":
            case "MARK_PACKED":
            case "DISPATCH": {
                if (!isNonEmptyString(body.shipmentId)) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: "A valid shipment ID is required.",
                        },
                        { status: 400 },
                    );
                }

                const shipmentId = body.shipmentId.trim();

                switch (body.action) {
                    case "START_PACKING": {
                        const data = await startPacking(
                            shipmentId,
                            admin.id,
                        );

                        return NextResponse.json({
                            success: true,
                            message: "Packing started.",
                            data,
                        });
                    }

                    case "VERIFY_ITEM": {
                        if (!isNonEmptyString(body.orderItemId)) {
                            return NextResponse.json(
                                {
                                    success: false,
                                    message: "A valid order item ID is required.",
                                },
                                { status: 400 },
                            );
                        }

                        const data = await verifyShipmentItem(
                            shipmentId,
                            body.orderItemId.trim(),
                            admin.id,
                        );

                        return NextResponse.json({
                            success: true,
                            message: data.alreadyVerified
                                ? "This item was already verified."
                                : "Item verified.",
                            data,
                        });
                    }

                    case "MARK_PACKED": {
                        const data = await markShipmentPacked(
                            shipmentId,
                            admin.id,
                        );

                        return NextResponse.json({
                            success: true,
                            message: "Shipment marked as packed.",
                            data,
                        });
                    }

                    case "DISPATCH": {
                        const data = await dispatchShipment(
                            shipmentId,
                            admin.id,
                        );

                        return NextResponse.json({
                            success: true,
                            message: "Shipment dispatched.",
                            data,
                        });
                    }
                }

                break;
            }

            default:
                return NextResponse.json(
                    { success: false, message: "Unknown action." },
                    { status: 400 },
                );
        }

        return NextResponse.json(
            { success: false, message: "Unsupported action." },
            { status: 400 },
        );
    } catch (error) {
        return errorResponse(error);
    }
}
