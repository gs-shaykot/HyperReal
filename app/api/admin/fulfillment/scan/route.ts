import { getAdminUser } from "@/lib/auth/getAdminUser";

import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";
import { hashParcelToken } from "@/lib/service/trackingService";

import { NextResponse } from "next/server";


export async function POST(request: Request) {
    try {
        if (!(Boolean(await getAdminUser()))) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 },
            );
        }

        let body: {
            token?: unknown;
            lookup?: unknown;
        };

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid JSON body." },
                { status: 400 },
            );
        }

        const token =
            typeof body.token === "string" ? body.token.trim() : "";
        const lookup =
            typeof body.lookup === "string" ? body.lookup.trim() : "";

        if (!token && !lookup) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Enter a parcel token, tracking code, or order code.",
                },
                { status: 400 },
            );
        }

        const shipment = token
            ? await prisma.shipment.findUnique({
                where: {
                    parcelTokenHash: hashParcelToken(token),
                },
                select: {
                    id: true,
                    trackingCode: true,
                    fulfillmentStatus: true,
                    status: true,
                    order: {
                        select: {
                            id: true,
                            orderCode: true,
                        },
                    },
                },
            })
            : await prisma.shipment.findFirst({
                where: {
                    OR: [
                        {
                            trackingCode: {
                                equals: lookup,
                                mode: "insensitive",
                            },
                        },
                        {
                            order: {
                                is: {
                                    orderCode: {
                                        equals: lookup,
                                        mode: "insensitive",
                                    },
                                },
                            },
                        },
                    ],
                },
                select: {
                    id: true,
                    trackingCode: true,
                    fulfillmentStatus: true,
                    status: true,
                    order: {
                        select: {
                            id: true,
                            orderCode: true,
                        },
                    },
                },
            });

        if (!shipment) {
            // Support locating an eligible order that has not yet had
            // a shipment created.
            if (!token && lookup) {
                const order = await prisma.order.findFirst({
                    where: {
                        orderCode: {
                            equals: lookup,
                            mode: "insensitive",
                        },
                    },
                    select: {
                        id: true,
                        orderCode: true,
                    },
                });

                if (order) {
                    return NextResponse.json({
                        success: true,
                        message: "Order found; no shipment has been created yet.",
                        data: {
                            shipment: null,
                            trackingCode: null,
                            order,
                        },
                    });
                }
            }

            return NextResponse.json(
                { success: false, message: "Parcel not found." },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            message: "Parcel found.",
            data: {
                shipment: {
                    id: shipment.id,
                    fulfillmentStatus: shipment.fulfillmentStatus,
                    status: shipment.status,
                },
                trackingCode: shipment.trackingCode,
                order: shipment.order,
            },
        });
    }
    catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError
        ) {
        } else {
        }

        return NextResponse.json(
            {
                success: false,
                message: "Could not look up the parcel.",
            },
            { status: 500 },
        );
    }
}
