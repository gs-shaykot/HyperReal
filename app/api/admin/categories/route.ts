
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body: unknown = await req.json();

        if (
            typeof body !== "object" ||
            body === null ||
            !("name" in body) ||
            typeof body.name !== "string"
        ) {
            return NextResponse.json(
                { success: false, message: "Category name is required." },
                { status: 400 }
            );
        }

        const name = body.name.trim().replace(/\s+/g, " ");

        if (!name) {
            return NextResponse.json(
                { success: false, message: "Category name is required." },
                { status: 400 }
            );
        }

        if (name.length > 60) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Category name must be 60 characters or fewer.",
                },
                { status: 400 }
            );
        }

        const slug = name
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        if (!slug) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Please enter a category name containing letters or numbers.",
                },
                { status: 400 }
            );
        }

        const existingCategory = await prisma.category.findFirst({
            where: {
                OR: [
                    { name: { equals: name, mode: "insensitive" } },
                    { slug },
                ],
            },
            select: { id: true },
        });

        if (existingCategory) {
            return NextResponse.json(
                {
                    success: false,
                    message: "A category with this name already exists.",
                },
                { status: 409 }
            );
        }

        const category = await prisma.category.create({
            data: { name, slug },
            select: {
                id: true,
                name: true,
                slug: true,
                createdAt: true,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Category created successfully.",
                data: category,
            },
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
                {
                    success: false,
                    message: "A category with this name or slug already exists.",
                },
                { status: 409 }
            );
        }

        console.error("Create admin category error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to create category.",
            },
            { status: 500 }
        );
    }
}
