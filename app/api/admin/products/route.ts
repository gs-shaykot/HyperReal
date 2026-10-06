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

        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { success: false, message: "Unauthorized", }, { status: 401 }
            );
        }

        const body = await req.json();

        const { name, category, price, description, sizes, stockBySize, colors } = body;

        if (typeof name !== "string" || !name.trim()) {
            return NextResponse.json(
                { success: false, message: "Product name is required" }, { status: 400 }
            );
        }

        if (typeof category !== "string" || !category.trim()) {
            return NextResponse.json(
                { success: false, message: "Category is required", }, { status: 400 }
            );
        }

        if (typeof description !== "string" || !description.trim()) {
            return NextResponse.json(
                { success: false, message: "Description is required", }, { status: 400 }
            );
        }

        const numericPrice = Number(price);

        if (
            !Number.isFinite(numericPrice) ||
            numericPrice < 0
        ) {
            return NextResponse.json(

                { success: false, message: "Price must be a valid non- negative number", }, { status: 400 }
            );
        }

        // --------------------------------------------------
        // 4. VALIDATE SIZES
        // --------------------------------------------------

        if (!Array.isArray(sizes) || sizes.length === 0) {
            return NextResponse.json(
                { success: false, message: "At least one size is required", }, { status: 400 }
            );
        }

        const cleanedSizes = sizes
            .filter(
                (size): size is string =>
                    typeof size === "string"
            )
            .map((size) => size.trim())
            .filter(Boolean);

        if (
            cleanedSizes.length !==
            new Set(cleanedSizes).size
        ) {
            return NextResponse.json(
                { success: false, message: "Duplicate sizes are not allowed", }, { status: 400 }
            );
        }

        // --------------------------------------------------
        // 5. VALIDATE STOCK BY SIZE
        // --------------------------------------------------

        if (!stockBySize || typeof stockBySize !== "object" || Array.isArray(stockBySize)) {
            return NextResponse.json(
                { success: false, message: "Stock by size is required", }, { status: 400 }
            );
        }

        const cleanedStockBySize: Record<
            string,
            number
        > = {};

        for (const size of cleanedSizes) {
            const stock = Number(
                stockBySize[size]
            );

            if (
                !Number.isFinite(stock) ||
                stock < 0 ||
                !Number.isInteger(stock)
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `Invalid stock for size ${size}`,
                    },
                    { status: 400 }
                );
            }

            cleanedStockBySize[size] = stock;
        }

        // --------------------------------------------------
        // 6. VALIDATE COLORS
        // --------------------------------------------------

        if (
            !Array.isArray(colors) ||
            colors.length === 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "At least one color is required",
                },
                { status: 400 }
            );
        }

        const cleanedColors = colors.map(
            (color: unknown) => {
                if (
                    !color ||
                    typeof color !== "object"
                ) {
                    throw new Error(
                        "Invalid color data"
                    );
                }

                const item =
                    color as {
                        name?: unknown;
                        hex?: unknown;
                        imageUrl?: unknown;
                    };

                const colorName =
                    typeof item.name === "string"
                        ? item.name.trim()
                        : "";

                const colorHex =
                    typeof item.hex === "string"
                        ? item.hex.trim()
                        : "";

                const imageUrl =
                    typeof item.imageUrl ===
                        "string"
                        ? item.imageUrl.trim()
                        : "";

                if (!colorName) {
                    throw new Error(
                        "Every color must have a name"
                    );
                }

                if (!colorHex) {
                    throw new Error(
                        `Hex color is required for ${colorName}`
                    );
                }

                if (!imageUrl) {
                    throw new Error(
                        `Image is required for ${colorName}`
                    );
                }

                return {
                    name: colorName,
                    hex: colorHex,
                    imageUrl,
                };
            }
        );

        // --------------------------------------------------
        // 7. PREVENT DUPLICATE COLORS
        // --------------------------------------------------

        const normalizedColorNames =
            cleanedColors.map((color) =>
                color.name.toLowerCase()
            );

        if (
            new Set(normalizedColorNames).size !==
            normalizedColorNames.length
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Duplicate colors are not allowed",
                },
                { status: 400 }
            );
        }

        // --------------------------------------------------
        // 8. VERIFY CATEGORY EXISTS
        // --------------------------------------------------

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
                {
                    success: false,
                    message:
                        "Selected category does not exist",
                },
                { status: 400 }
            );
        }

        // --------------------------------------------------
        // 9. CREATE PRODUCT
        // --------------------------------------------------

        const product =
            await prisma.product.create({
                data: {
                    name: name.trim(),

                    description:
                        description.trim(),

                    price: numericPrice,

                    categoryId: category,

                    // ----------------------------------
                    // PRODUCT IMAGES
                    // ----------------------------------

                    productImages: {
                        create: cleanedColors.map(
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
                            cleanedColors.flatMap(
                                (color) =>
                                    cleanedSizes.map(
                                        (size) => ({
                                            size,

                                            color:
                                                color.name,

                                            hex:
                                                color.hex,

                                            stock:
                                                cleanedStockBySize[
                                                size
                                                ],
                                        })
                                    )
                            ),
                    },
                },

                select: productSelect,
            });

        // --------------------------------------------------
        // 10. SUCCESS
        // --------------------------------------------------

        return NextResponse.json(
            {
                success: true,
                message:
                    "Product created successfully",
                data: product,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error(
            "Create product error:",
            error
        );
 
        if (
            error instanceof Error &&
            [
                "Invalid color data",
                "Every color must have a name",
            ].includes(error.message)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message,
                },
                { status: 400 }
            );
        }

        if (
            error instanceof Error &&
            (
                error.message.startsWith(
                    "Hex color is required"
                ) ||
                error.message.startsWith(
                    "Image is required"
                )
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message,
                },
                { status: 400 }
            );
        }

        // ----------------------------------------------
        // DUPLICATE VARIANT / OTHER PRISMA ERROR
        // ----------------------------------------------

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