
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

async function isAdmin() {
    const session = await getServerSession(authOptions);
    return session?.user?.role === "ADMIN";
}

function validateCountry(body: Record<string, unknown>) {
    const requiredText = [
        "name",
        "code",
        "phoneCode",
        "currencyCode",
        "currencySymbol",
    ];

    for (const field of requiredText) {
        if (
            typeof body[field] !== "string" ||
            !(body[field] as string).trim()
        ) {
            return `${field} is required.`;
        }
    }

    if (
        typeof body.shippingFeeUSD !== "number" ||
        !Number.isFinite(body.shippingFeeUSD) ||
        body.shippingFeeUSD < 0
    ) {
        return "Shipping fee must be zero or greater.";
    }

    if (
        typeof body.freeShippingThresholdUSD !== "number" ||
        !Number.isFinite(body.freeShippingThresholdUSD) ||
        body.freeShippingThresholdUSD < 0
    ) {
        return "Free-shipping threshold must be zero or greater.";
    }

    if (
        body.isActive !== undefined &&
        typeof body.isActive !== "boolean"
    ) {
        return "Invalid active status.";
    }

    return null;
}

function countryData(body: Record<string, unknown>) {
    return {
        name: (body.name as string).trim(),
        code: (body.code as string).trim().toUpperCase(),
        phoneCode: (body.phoneCode as string).trim(),
        currencyCode: (body.currencyCode as string)
            .trim()
            .toUpperCase(),
        currencySymbol: (body.currencySymbol as string).trim(),
        shippingFeeUSD: body.shippingFeeUSD as number,
        freeShippingThresholdUSD:
            body.freeShippingThresholdUSD as number,
        ...(typeof body.isActive === "boolean"
            ? { isActive: body.isActive }
            : {}),
    };
}

function isPrismaError(
    error: unknown,
    code: string
): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === code
    );
}

export async function GET() {
    try {
        // Do not seed countries here. Otherwise, a deleted starter
        // country could be recreated on the next request.
        const countries = await prisma.operationalCountry.findMany({
            orderBy: { name: "asc" },
        });

        return NextResponse.json(
            { success: true, data: countries },
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        console.error("Get operational countries error:", error);

        return NextResponse.json(
            { message: "Failed to load countries." },
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
        const validationError = validateCountry(body);

        if (validationError) {
            return NextResponse.json(
                { message: validationError },
                { status: 400 }
            );
        }

        const country = await prisma.operationalCountry.create({
            data: countryData(body),
        });

        return NextResponse.json(
            {
                success: true,
                data: country,
                message: "Country added.",
            },
            { status: 201 }
        );
    } catch (error) {
        if (isPrismaError(error, "P2002")) {
            return NextResponse.json(
                {
                    message:
                        "A country with this country code already exists.",
                },
                { status: 409 }
            );
        }

        console.error("Create operational country error:", error);

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

        if (typeof body.id !== "string" || !body.id) {
            return NextResponse.json(
                { message: "Country ID is required." },
                { status: 400 }
            );
        }

        const validationError = validateCountry(body);

        if (validationError) {
            return NextResponse.json(
                { message: validationError },
                { status: 400 }
            );
        }

        const country = await prisma.operationalCountry.update({
            where: { id: body.id },
            data: countryData(body),
        });

        return NextResponse.json({
            success: true,
            data: country,
            message: "Country updated.",
        });
    } catch (error) {
        if (isPrismaError(error, "P2002")) {
            return NextResponse.json(
                {
                    message:
                        "A country with this country code already exists.",
                },
                { status: 409 }
            );
        }

        if (isPrismaError(error, "P2025")) {
            return NextResponse.json(
                { message: "Country not found." },
                { status: 404 }
            );
        }

        console.error("Update operational country error:", error);

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

        const body = await req.json();

        if (typeof body.id !== "string" || !body.id.trim()) {
            return NextResponse.json(
                { message: "Country ID is required." },
                { status: 400 }
            );
        }

        const country = await prisma.operationalCountry.delete({
            where: { id: body.id },
        });

        return NextResponse.json({
            success: true,
            message: `${country.name} deleted.`,
        });
    } catch (error) {
        if (isPrismaError(error, "P2025")) {
            return NextResponse.json(
                { message: "Country not found." },
                { status: 404 }
            );
        }

        if (isPrismaError(error, "P2003")) {
            return NextResponse.json(
                {
                    message:
                        "This country cannot be deleted because another record depends on it.",
                },
                { status: 409 }
            );
        }

        console.error("Delete operational country error:", error);

        return NextResponse.json(
            { message: "Failed to delete country." },
            { status: 500 }
        );
    }
}
