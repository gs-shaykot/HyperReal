
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function isAdmin() {
    const session = await getServerSession(authOptions);
    return Boolean(session?.user && session.user.role === "ADMIN");
}

export async function POST(req: Request) {
    try {
        if (!(await isAdmin())) {
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
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        if (!slug) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Please enter a category name containing letters or numbers.",
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


        return NextResponse.json(
            {
                success: false,
                message: "Failed to create category.",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body: unknown = await req.json();

        if (
            typeof body !== "object" ||
            body === null ||
            !("id" in body) ||
            typeof body.id !== "string" ||
            !body.id.trim()
        ) {
            return NextResponse.json(
                { success: false, message: "A valid category ID is required." },
                { status: 400 }
            );
        }

        const category = await prisma.category.findUnique({
            where: { id: body.id },
            select: {
                id: true,
                name: true,
            },
        });

        if (!category) {
            return NextResponse.json(
                { success: false, message: "Category not found." },
                { status: 404 }
            );
        }

        const productCount = await prisma.product.count({
            where: { categoryId: category.id },
        });

        if (productCount > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Cannot delete "${category.name}" because ${productCount} product(s) still use it. Reassign those products first.`,
                },
                { status: 409 }
            );
        }

        await prisma.category.delete({
            where: { id: category.id },
        });

        return NextResponse.json({
            success: true,
            message: `Category "${category.name}" deleted successfully.`,
        });
    } catch (error) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2003"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "This category is still referenced by another record and cannot be deleted.",
                },
                { status: 409 }
            );
        }


        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete category.",
            },
            { status: 500 }
        );
    }
}
