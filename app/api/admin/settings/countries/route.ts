
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

async function isAdmin() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) return false;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, isBlocked: true },
    });

    return user?.role === "ADMIN" && !user.isBlocked;
}

export async function GET() {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const countries = await prisma.operationalCountry.findMany({
            orderBy: { name: "asc" },
        });

        return NextResponse.json({ data: countries });
    } catch {
        return NextResponse.json(
            { message: "Failed to fetch countries" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();

        const name = String(body.name ?? "").trim();
        const code = String(body.code ?? "").trim().toUpperCase();
        const currencyCode = String(body.currencyCode ?? "").trim().toUpperCase();
        const currencySymbol = String(body.currencySymbol ?? "").trim();
        const shippingFeeUSD = Number(body.shippingFeeUSD);
        const freeShippingThresholdUSD = Number(body.freeShippingThresholdUSD);

        if (
            !name ||
            !/^[A-Z]{2}$/.test(code) ||
            !/^[A-Z]{3}$/.test(currencyCode) ||
            !currencySymbol ||
            !Number.isFinite(shippingFeeUSD) ||
            shippingFeeUSD < 0 ||
            !Number.isFinite(freeShippingThresholdUSD) ||
            freeShippingThresholdUSD < 0
        ) {
            return NextResponse.json(
                { message: "Please check the country and shipping fields." },
                { status: 400 }
            );
        }

        const country = await prisma.operationalCountry.create({
            data: {
                name,
                code,
                currencyCode,
                currencySymbol,
                shippingFeeUSD,
                freeShippingThresholdUSD,
                isActive: body.isActive !== false,
            },
        });

        return NextResponse.json(
            { success: true, data: country },
            { status: 201 }
        );
    } catch (error: unknown) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                { message: "This country code already exists." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { message: "Failed to add country." },
            { status: 500 }
        );
    }
}

export async function PUT(req: Request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const id = String(body.id ?? "");

        if (!id) {
            return NextResponse.json(
                { message: "Country ID is required." },
                { status: 400 }
            );
        }

        const data: Record<string, unknown> = {};

        if (typeof body.name === "string") data.name = body.name.trim();
        if (typeof body.currencyCode === "string") {
            data.currencyCode = body.currencyCode.trim().toUpperCase();
        }
        if (typeof body.currencySymbol === "string") {
            data.currencySymbol = body.currencySymbol.trim();
        }
        if (typeof body.isActive === "boolean") data.isActive = body.isActive;

        for (const field of [
            "shippingFeeUSD",
            "freeShippingThresholdUSD",
        ] as const) {
            if (body[field] !== undefined) {
                const value = Number(body[field]);

                if (!Number.isFinite(value) || value < 0) {
                    return NextResponse.json(
                        { message: `${field} must be zero or greater.` },
                        { status: 400 }
                    );
                }

                data[field] = value;
            }
        }

        const country = await prisma.operationalCountry.update({
            where: { id },
            data,
        });

        return NextResponse.json({ success: true, data: country });
    } catch {
        return NextResponse.json(
            { message: "Failed to update country." },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await req.json();

        if (!id || typeof id !== "string") {
            return NextResponse.json(
                { message: "Country ID is required." },
                { status: 400 }
            );
        }

        await prisma.operationalCountry.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { message: "Failed to delete country." },
            { status: 500 }
        );
    }
}
