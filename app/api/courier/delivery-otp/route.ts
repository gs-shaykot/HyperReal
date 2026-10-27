import { createHash, randomInt } from "node:crypto";
import nodemailer from "nodemailer";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.sessionRevoked) {
        return NextResponse.json({ success: false, message: "Sign in to request a delivery code." }, { status: 401 });
    }

    const courier = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, role: true, isBlocked: true, courierProfile: { select: { isActive: true } } },
    });

    if (!courier || courier.role !== "COURIER" || courier.isBlocked || !courier.courierProfile?.isActive) {
        return NextResponse.json({ success: false, message: "An active courier account is required." }, { status: 403 });
    }

    let body: { shipmentId?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ success: false, message: "Invalid request body." }, { status: 400 });
    }

    const shipmentId = typeof body.shipmentId === "string" ? body.shipmentId.trim() : "";
    if (!shipmentId) {
        return NextResponse.json({ success: false, message: "A shipment ID is required." }, { status: 400 });
    }

    try {
        const shipment = await prisma.shipment.findFirst({
            where: { id: shipmentId, assignedCourierId: courier.id },
            select: {
                id: true, status: true, otpLastSentAt: true,
                order: { select: { orderCode: true, user: { select: { email: true, name: true } } } },
            },
        });

        if (!shipment) {
            return NextResponse.json({ success: false, message: "This delivery is not assigned to your account." }, { status: 404 });
        }
        if (shipment.status !== "OUT_FOR_DELIVERY") {
            return NextResponse.json({ success: false, message: "Start delivery before requesting a verification code." }, { status: 409 });
        }
        if (!shipment.order.user.email) {
            return NextResponse.json({ success: false, message: "The customer has no email address for delivery verification." }, { status: 400 });
        }
        if (shipment.otpLastSentAt && Date.now() - shipment.otpLastSentAt.getTime() < 60_000) {
            return NextResponse.json({ success: false, message: "Please wait 60 seconds before requesting another code." }, { status: 429 });
        }

        const otp = randomInt(100000, 1000000).toString();
        const otpHash = createHash("sha256").update(otp).digest("hex");
        const expiresAt = new Date(Date.now() + 5 * 60_000);

        const emailUser = process.env.EMAIL_USER;
        const emailPassword = process.env.EMAIL_PASSWORD;
        if (!emailUser || !emailPassword) {
            return NextResponse.json({ success: false, message: "Delivery email service is not configured." }, { status: 503 });
        }

        const sender = nodemailer.createTransport({
            service: "gmail",
            auth: { user: emailUser, pass: emailPassword },
        });

        await sender.sendMail({
            from: `"HyperReal Delivery" <${emailUser}>`,
            to: shipment.order.user.email,
            subject: `Verify delivery for order ${shipment.order.orderCode}`,
            text: `Your HyperReal delivery verification code is ${otp}. It expires in 5 minutes. Only share this code with the courier when you receive your parcel. If you did not expect this delivery, do not share the code.`,
            html: `<div style="font-family:monospace;background:#09090b;color:#e4e4e7;padding:28px"><p style="color:#a3e635;letter-spacing:3px">HYPERREAL / DELIVERY SECURITY</p><h2>Confirm your parcel</h2><p>Use this code to confirm delivery for order <strong>${shipment.order.orderCode}</strong>.</p><h1 style="color:#a3e635;letter-spacing:8px">${otp}</h1><p>This code expires in 5 minutes. Only share it with the courier when your parcel is physically received.</p><p style="color:#a1a1aa;font-size:12px">If you did not expect this delivery, do not share the code.</p></div>`,
        });

        await prisma.shipment.update({
            where: { id: shipment.id },
            data: { otpHash, otpExpiresAt: expiresAt, otpAttempts: 0, otpLastSentAt: new Date() },
        });

        return NextResponse.json({ success: true, message: "Verification code sent to the customer's email. It expires in 5 minutes." });
    } catch (error) {
        console.error("Delivery OTP request failed:", error);
        return NextResponse.json({ success: false, message: "Could not send the delivery verification code." }, { status: 500 });
    }
}
