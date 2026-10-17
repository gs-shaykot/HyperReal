
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const STARTER_COUNTRIES = [
    { name: "Bangladesh", code: "BD", phoneCode: "+880", currencyCode: "BDT", currencySymbol: "৳", shippingFeeUSD: 1.2, freeShippingThresholdUSD: 100 },
    { name: "United States", code: "US", phoneCode: "+1", currencyCode: "USD", currencySymbol: "$", shippingFeeUSD: 15, freeShippingThresholdUSD: 150 },
    { name: "United Kingdom", code: "GB", phoneCode: "+44", currencyCode: "GBP", currencySymbol: "£", shippingFeeUSD: 15, freeShippingThresholdUSD: 150 },
    { name: "Germany", code: "DE", phoneCode: "+49", currencyCode: "EUR", currencySymbol: "€", shippingFeeUSD: 15, freeShippingThresholdUSD: 150 },
    { name: "Japan", code: "JP", phoneCode: "+81", currencyCode: "JPY", currencySymbol: "¥", shippingFeeUSD: 15, freeShippingThresholdUSD: 150 },
    { name: "Australia", code: "AU", phoneCode: "+61", currencyCode: "AUD", currencySymbol: "A$", shippingFeeUSD: 20, freeShippingThresholdUSD: 175 },
    { name: "Canada", code: "CA", phoneCode: "+1", currencyCode: "CAD", currencySymbol: "C$", shippingFeeUSD: 20, freeShippingThresholdUSD: 175 },
    { name: "India", code: "IN", phoneCode: "+91", currencyCode: "INR", currencySymbol: "₹", shippingFeeUSD: 10, freeShippingThresholdUSD: 125 },
];

async function isAdmin() {
    const session = await getServerSession(authOptions);
    return session?.user?.role === "ADMIN";
}

async function seedStarterCountries() {
    for (const country of STARTER_COUNTRIES) {
        await prisma.operationalCountry.upsert({
            where: { code: country.code },
            update: {},
            create: country,
        });
    }
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

    if (body.isActive !== undefined && typeof body.isActive !== "boolean") {
        return "Invalid active status.";
    }

    return null;
}

function countryData(body: Record<string, unknown>) {
    return {
        name: (body.name as string).trim(),
        code: (body.code as string).trim().toUpperCase(),
        phoneCode: (body.phoneCode as string).trim(),
        currencyCode: (body.currencyCode as string).trim().toUpperCase(),
        currencySymbol: (body.currencySymbol as string).trim(),
        shippingFeeUSD: body.shippingFeeUSD as number,
        freeShippingThresholdUSD: body.freeShippingThresholdUSD as number,
        ...(typeof body.isActive === "boolean"
            ? { isActive: body.isActive }
            : {}),
    };
}

export async function GET() {
    try {
        await seedStarterCountries();

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
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validationError = validateCountry(body);

        if (validationError) {
            return NextResponse.json({ message: validationError }, { status: 400 });
        }

        const data = countryData(body);

        const country = await prisma.operationalCountry.create({ data });

        return NextResponse.json(
            { success: true, data: country, message: "Country added." },
            { status: 201 }
        );
    } catch (error) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                { message: "A country with this country code already exists." },
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
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        if (typeof body.id !== "string" || !body.id) {
            return NextResponse.json({ message: "Country ID is required." }, { status: 400 });
        }

        const validationError = validateCountry(body);

        if (validationError) {
            return NextResponse.json({ message: validationError }, { status: 400 });
        }

        const data = countryData(body);

        const country = await prisma.operationalCountry.update({
            where: { id: body.id },
            data,
        });

        return NextResponse.json({
            success: true,
            data: country,
            message: "Country updated.",
        });
    } catch (error) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                { message: "A country with this country code already exists." },
                { status: 409 }
            );
        }

        console.error("Update operational country error:", error);

        return NextResponse.json(
            { message: "Failed to update country." },
            { status: 500 }
        );
    }
}
