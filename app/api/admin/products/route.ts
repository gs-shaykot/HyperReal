import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getAdminProducts } from "@/utils/AdminUtils/getAdminProducts";
import { getServerSession } from "next-auth";
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
        const session =
            await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { success: false, message: "Unauthorized", }, { status: 401 }
            );
        }

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
        console.error(
            "Admin products error:",
            error
        );

        return NextResponse.json(
            { success: false, message: "Failed to fetch products", }, { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session =
            await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { success: false, message: "Unauthorized", }, { status: 401 }
            );
        }

        const body = await req.json();

        const { name, category, price, description, sizes, stockBySize, colors, } = validateProductInput(body);

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
        console.error("Create product error:", error);

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
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const admin = await prisma.user.findUnique({
            where: {
                id: session.user.id,
            },
            select: {
                role: true,
            },
        });

        if (admin?.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        // --------------------------------------------------
        // 2. Get product ID
        // --------------------------------------------------
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Product ID is required" },
                { status: 400 }
            );
        }

        // --------------------------------------------------
        // 3. Parse request body
        // --------------------------------------------------
        const body = await req.json();

        // --------------------------------------------------
        // 4. Shared product validation
        // --------------------------------------------------
        const {
            name,
            category,
            price,
            description,
            sizes,
            stockBySize,
            colors,
        } = validateProductInput(body);

        // --------------------------------------------------
        // 5. Check product exists
        // --------------------------------------------------
        const existingProduct = await prisma.product.findUnique({
            where: {
                id,
            },
            include: {
                productVariants: {
                    select: {
                        id: true,
                        size: true,
                        color: true,
                    },
                },
                productImages: {
                    select: {
                        id: true,
                        imageUrl: true,
                        color: true,
                    }
                }
            },
        });

        if (!existingProduct) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        const oldImageUrls = existingProduct.productImages.map(
            (image) => image.imageUrl
        );


        // --------------------------------------------------
        // 6. Check category exists
        // --------------------------------------------------
        const existingCategory = await prisma.category.findUnique({
            where: {
                id: category,
            },
            select: {
                id: true,
            },
        });

        if (!existingCategory) {
            return NextResponse.json(
                { error: "Category not found" },
                { status: 404 }
            );
        }

        // --------------------------------------------------
        // 7. Build incoming variant keys
        //
        // Every color × every size must exist.
        // --------------------------------------------------
        const incomingVariantKeys = new Set(
            colors.flatMap((color) =>
                sizes.map(
                    (size) => `${color.name}::${size}`
                )
            )
        );

        // --------------------------------------------------
        // 8. Update inside transaction
        // --------------------------------------------------
        const updatedProduct = await prisma.$transaction(
            async (tx) => {
                // ------------------------------------------
                // 8.1 Find existing variants
                // ------------------------------------------
                const existingVariants =
                    await tx.productVariant.findMany({
                        where: {
                            productId: id,
                        },
                        select: {
                            id: true,
                            size: true,
                            color: true,
                        },
                    });

                // ------------------------------------------
                // 8.2 Remove variants that no longer exist
                // ------------------------------------------
                for (const variant of existingVariants) {
                    const variantKey =
                        `${variant.color}::${variant.size}`;

                    if (incomingVariantKeys.has(variantKey)) {
                        continue;
                    }

                    // --------------------------------------
                    // Variant is being removed.
                    //
                    // Never remove a variant already used
                    // by an order.
                    // --------------------------------------
                    const orderItemCount =
                        await tx.orderItem.count({
                            where: {
                                variantId: variant.id,
                            },
                        });

                    if (orderItemCount > 0) {
                        throw new ProductValidationError(
                            `Cannot remove variant "${variant.color} / ${variant.size}" because it has already been used in an order.`,
                            409
                        );
                    }

                    // --------------------------------------
                    // Remove cart references
                    // --------------------------------------
                    await tx.cartItem.deleteMany({
                        where: {
                            variantId: variant.id,
                        },
                    });

                    // --------------------------------------
                    // Remove wishlist references
                    // --------------------------------------
                    await tx.wishlist.deleteMany({
                        where: {
                            productVariantId: variant.id,
                        },
                    });

                    // --------------------------------------
                    // Finally remove the variant
                    // --------------------------------------
                    await tx.productVariant.delete({
                        where: {
                            id: variant.id,
                        },
                    });
                }

                // ------------------------------------------
                // 8.3 Upsert every color × size variant
                // ------------------------------------------
                for (const color of colors) {
                    for (const size of sizes) {
                        await tx.productVariant.upsert({
                            where: {
                                productId_size_color: {
                                    productId: id,
                                    size,
                                    color: color.name,
                                },
                            },

                            update: {
                                stock: stockBySize[size],
                                hex: color.hex,
                            },

                            create: {
                                productId: id,
                                size,
                                color: color.name,
                                hex: color.hex,
                                stock: stockBySize[size],
                            },
                        });
                    }
                }

                // ------------------------------------------
                // 8.4 Replace product images
                //
                // Image rows are not referenced by orders,
                // so replacing them is safe.
                // ------------------------------------------
                await tx.productImage.deleteMany({
                    where: {
                        productId: id,
                    },
                });

                await tx.productImage.createMany({
                    data: colors.map((color) => ({
                        productId: id,
                        imageUrl: color.imageUrl,
                        color: color.name,
                    })),
                });

                // ------------------------------------------
                // 8.5 Update product itself
                // ------------------------------------------
                return tx.product.update({
                    where: {
                        id,
                    },

                    data: {
                        name,
                        description,
                        price,
                        categoryId: category,
                    },

                    select: {
                        id: true,
                        name: true,
                        description: true,
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
                                    color: "asc",
                                },
                                {
                                    size: "asc",
                                },
                            ],
                        },
                    },
                });
            }
        );

        const newImageUrls = updatedProduct.productImages.map((image) => image.imageUrl);

        const removedImageUrls = oldImageUrls.filter((oldUrl) => !newImageUrls.includes(oldUrl));

        await deleteCloudinaryImages(removedImageUrls);

        // --------------------------------------------------
        // 9. Success
        // --------------------------------------------------
        return NextResponse.json(
            {
                success: true,
                message: "Product updated successfully",
                data: updatedProduct,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        // --------------------------------------------------
        // Validation errors
        // --------------------------------------------------
        if (error instanceof ProductValidationError) {
            return NextResponse.json(
                {
                    error: error.message,
                },
                {
                    status: error.status,
                }
            );
        }

        console.error(
            "PATCH /api/admin/products error:",
            error
        );

        return NextResponse.json(
            {
                error: "Failed to update product",
            },
            {
                status: 500,
            }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const session =
            await getServerSession(authOptions);

        if (
            !session?.user ||
            session.user.role !== "ADMIN"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

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
        console.error(
            "Delete product error:",
            error
        );

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