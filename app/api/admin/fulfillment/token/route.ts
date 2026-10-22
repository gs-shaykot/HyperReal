
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { rotateParcelToken, TrackingError } from "@/lib/service/trackingService";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 },
            );
        }

        const body: unknown = await req.json();

        if (
            typeof body !== "object" ||
            body === null ||
            !("shipmentId" in body) ||
            typeof body.shipmentId !== "string" ||
            !body.shipmentId.trim()
        ) {
            return NextResponse.json(
                { success: false, message: "A valid shipment ID is required." },
                { status: 400 },
            );
        }

        const shipment = await rotateParcelToken(body.shipmentId.trim());

        return NextResponse.json({
            success: true,
            message: "Parcel QR token generated. Save it now; it will not be returned again.",
            data: shipment,
        });
    } catch (error) {
        if (error instanceof TrackingError) {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: error.statusCode },
            );
        }

        console.error("Parcel token generation error:", error);

        return NextResponse.json(
            { success: false, message: "Could not generate the parcel token." },
            { status: 500 },
        );
    }
}
