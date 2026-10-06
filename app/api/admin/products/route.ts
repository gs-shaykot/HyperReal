import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getAdminProducts } from "@/utils/AdminUtils/getAdminProducts";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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
        },
        take: 1,
    },

    productVariants: {
        select: {
            size: true,
        },
        orderBy: {
            size: "asc" as const,
        },
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
        console.error("Admin products error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to fetch products", }, { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const body = await req.json();

        const {
            name,
            description,
            price,
            categoryId,
            sizes = [],
            stock,
            stockBySize = {},
            imageUrl = "",
        } = body;

        if (
            !name?.trim() ||
            !description?.trim() ||
            !categoryId ||
            !Number.isFinite(price)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid product data.",
                },
                { status: 400 }
            );
        }

        const normalizedSizes: string[] = [
            ...new Set(
                (Array.isArray(sizes) ? sizes : [])
                    .filter(
                        (size): size is string =>
                            typeof size === "string"
                    )
                    .map((size) => size.trim())
                    .filter(Boolean)
            ),
        ];

        /*
         * Get stock for each size.
         *
         * stockBySize is used when different stock
         * values are entered for different sizes.
         *
         * stock is used as a fallback for the
         * "same stock for every size" case.
         */
        const getStock = (size: string) => {
            const sizeStock = stockBySize?.[size];

            const value =
                sizeStock !== undefined
                    ? Number(sizeStock)
                    : Number(stock ?? 0);

            return Number.isFinite(value)
                ? Math.max(0, Math.floor(value))
                : 0;
        };

        const product = await prisma.product.create({
            data: {
                name: name.trim(),
                description: description.trim(),
                price: Number(price),
                categoryId,

                productImages: imageUrl.trim()
                    ? {
                        create: {
                            imageUrl: imageUrl.trim(),
                        },
                    }
                    : undefined,

                productVariants:
                    normalizedSizes.length > 0
                        ? {
                            create: normalizedSizes.map(
                                (size: string) => ({
                                    size,
                                    color: "Carbon Void",
                                    stock: getStock(size),
                                })
                            ),
                        }
                        : undefined,
            },

            select: productSelect,
        });

        return NextResponse.json({
            success: true,
            data: product,
        });
    } catch (error) {
        console.error(
            "Add admin product error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Failed to add product.",
            },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
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

        const body = await req.json();

        const {
            id,
            name,
            description,
            price,
            categoryId,
            sizes = [],
            imageUrl = "",
        } = body;

        if (
            !id ||
            !name?.trim() ||
            !description?.trim() ||
            !categoryId ||
            !Number.isFinite(price)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid product data.",
                },
                { status: 400 }
            );
        }

        const product =
            await prisma.$transaction(
                async (tx) => {
                    await tx.product.update({
                        where: {
                            id,
                        },
                        data: {
                            name: name.trim(),
                            description:
                                description.trim(),
                            price: Number(price),
                            categoryId,
                        },
                    });

                    /*
                     * Update the product image.
                     */
                    const existingImage =
                        await tx.productImage.findFirst(
                            {
                                where: {
                                    productId: id,
                                },
                            }
                        );

                    if (imageUrl.trim()) {
                        if (existingImage) {
                            await tx.productImage.update(
                                {
                                    where: {
                                        id: existingImage.id,
                                    },
                                    data: {
                                        imageUrl:
                                            imageUrl.trim(),
                                    },
                                }
                            );
                        } else {
                            await tx.productImage.create(
                                {
                                    data: {
                                        productId: id,
                                        imageUrl:
                                            imageUrl.trim(),
                                    },
                                }
                            );
                        }
                    }

                    /*
                     * For now we only create missing
                     * sizes. Existing variants are kept
                     * because they may already be referenced
                     * by carts/orders/wishlists.
                     */
                    const existingVariants =
                        await tx.productVariant.findMany(
                            {
                                where: {
                                    productId: id,
                                },
                                select: {
                                    size: true,
                                },
                            }
                        );

                    const existingSizes =
                        new Set(
                            existingVariants.map(
                                (variant) =>
                                    variant.size
                            )
                        );

                    const newSizes =
                        sizes.filter(
                            (size: string) =>
                                !existingSizes.has(
                                    size
                                )
                        );

                    if (newSizes.length > 0) {
                        await tx.productVariant.createMany(
                            {
                                data: newSizes.map(
                                    (size: string) => ({
                                        productId: id,
                                        size,
                                        color:
                                            "Carbon Void",
                                        stock: 0,
                                    })
                                ),
                            }
                        );
                    }

                    return tx.product.findUnique({
                        where: {
                            id,
                        },
                        select: productSelect,
                    });
                }
            );

        return NextResponse.json({
            success: true,
            data: product,
        });
    } catch (error) {
        console.error(
            "Update admin product error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to update product.",
            },
            { status: 500 }
        );
    }
}