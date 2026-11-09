import { getAdminUser } from "@/lib/auth/getAdminUser";
import prisma from "@/lib/prisma";
import { getAdminProducts } from "@/utils/AdminUtils/getAdminProducts";
import { NextResponse } from "next/server";
import {
    ProductValidationError,
    validateProductInput,
} from "@/utils/AdminUtils/productValidation";
import { deleteCloudinaryImages } from "@/lib/cloudinary";


const productSelect = {
    id: true,
    name: true,
    description: true,
    searchKeywords: true,
    price: true,
    isAvailable: true,
    totalSold: true,
    totalLikes: true,
    createdAt: true,

    category: {
        select: {
            id: true,
            name: true,
        },
    },

    productImages: {
        select: {
            imageUrl: true,
            color: true,
        },
    },

    productVariants: {
        select: {
            id: true,
            size: true,
            color: true,
            stock: true,
            hex: true,
        },
        orderBy: [
            {
                color: "asc" as const,
            },
            {
                size: "asc" as const,
            },
        ],
    },
};

export async function GET(req: Request) {
    try {
        if (!(await getAdminUser())) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);

        const search = searchParams.get("search") ?? "";

        const categoryId = searchParams.get("category") ?? undefined;

        const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

        const data = await getAdminProducts({
            search,
            categoryId,
            page,
        });

        return NextResponse.json({ success: true, data, }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Failed to fetch products", }, { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        if (!(await getAdminUser())) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

        const body = await req.json();

        const { name, category, price, description, sizes, stockBySize, colors, searchKeywords } = validateProductInput(body);

        // ----------------------------------------------
        // VERIFY CATEGORY
        // ----------------------------------------------

        const categoryExists =
            await prisma.category.findUnique({
                where: {
                    id: category,
                },
                select: {
                    id: true,
                },
            });

        if (!categoryExists) {
            return NextResponse.json(
                { success: false, message: "Selected category does not exist" }, { status: 400 }
            );
        }

        // ----------------------------------------------
        // CREATE PRODUCT
        // ----------------------------------------------

        const product =
            await prisma.product.create({
                data: {
                    name,
                    description,
                    searchKeywords,
                    price,
                    categoryId: category,

                    productImages: {
                        create:
                            colors.map(
                                (color) => ({
                                    imageUrl:
                                        color.imageUrl,
                                    color:
                                        color.name,
                                })
                            ),
                    },

                    productVariants: {
                        create:
                            colors.flatMap(
                                (color) => sizes.map((size) => ({
                                    size,
                                    color: color.name,
                                    hex: color.hex,
                                    stock: stockBySize[size],
                                })
                                )
                            ),
                    },
                },

                select: productSelect,
            });

        return NextResponse.json(
            { success: true, message: "Product created successfully", data: product, }, { status: 201 }
        );
    } catch (error) {
        if (
            error instanceof
            ProductValidationError
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message,
                },
                {
                    status: error.status,
                }
            );
        }

        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "A product variant with the same size and color already exists.",
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to create product",
            },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    try {
        // --------------------------------------------------
        // 1. Admin authentication
        // --------------------------------------------------
        if (!(await getAdminUser())) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);

        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Product ID is required",
                },
                { status: 400 }
            );
        }

        const product = await prisma.product.findUnique({
            where: { id },
            select: {
                id: true,

                productImages: {
                    select: {
                        imageUrl: true,
                    },
                },

                productVariants: {
                    select: {
                        id: true,
                    },
                },
            },
        });

        if (!product) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Product not found",
                },
                { status: 404 }
            );
        }

        const imageUrls = product.productImages.map((image) => image.imageUrl);

        for (const variant of product.productVariants) {
            const orderItemCount =
                await prisma.orderItem.count({
                    where: {
                        variantId: variant.id,
                    },
                });

            if (orderItemCount > 0) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "This product cannot be deleted because it has already been used in an order.",
                    },
                    { status: 409 }
                );
            }
        }

        await prisma.$transaction(async (tx) => {
            await tx.wishlist.deleteMany({
                where: {
                    productId: id,
                },
            });

            await tx.cartItem.deleteMany({
                where: {
                    variant: {
                        productId: id,
                    },
                },
            });

            await tx.productImage.deleteMany({
                where: {
                    productId: id,
                },
            });

            await tx.productVariant.deleteMany({
                where: {
                    productId: id,
                },
            });

            await tx.product.delete({
                where: {
                    id,
                },
            });
        });

        await deleteCloudinaryImages(imageUrls);

        return NextResponse.json(
            {
                success: true,
                message:
                    "Product deleted successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to delete product",
            },
            { status: 500 }
        );
    }
}