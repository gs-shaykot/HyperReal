
import { Prisma } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { rotateParcelToken, TrackingError } from "@/lib/service/trackingService";

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (
            !session?.user?.id ||
            session.user.role !== "ADMIN"
        ) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 },
            );
        }

        let body: { shipmentId?: unknown };

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid JSON body." },
                { status: 400 },
            );
        }

        if (
            typeof body.shipmentId !== "string" ||
            !body.shipmentId.trim()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "A valid shipment ID is required.",
                },
                { status: 400 },
            );
        }

        const result = await rotateParcelToken(body.shipmentId.trim());

        return NextResponse.json({
            success: true,
            message: "Parcel token rotated. The previous token is no longer valid.",
            data: {
                shipmentId: result.shipment.id,
                trackingCode: result.shipment.trackingCode,
                parcelToken: result.token,
            },
        });
    } catch (error) {
        if (error instanceof TrackingError) {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: error.statusCode },
            );
        }

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2025"
        ) {
            return NextResponse.json(
                { success: false, message: "Shipment not found." },
                { status: 404 },
            );
        }

        console.error("Parcel token rotation failed:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Could not rotate the parcel token.",
            },
            { status: 500 },
        );
    }
}
