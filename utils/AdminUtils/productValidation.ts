export type ProductColorInput = {
    name: string;
    hex: string;
    imageUrl: string;
};

export type ValidatedProductInput = {
    name: string;
    category: string;
    price: number;
    description: string;
    sizes: string[];
    stockBySize: Record<string, number>;
    colors: ProductColorInput[];
};

export class ProductValidationError extends Error {
    status: number;

    constructor(
        message: string,
        status = 400
    ) {
        super(message);
        this.name =
            "ProductValidationError";
        this.status = status;
    }
}

export function validateProductInput(
    body: unknown
): ValidatedProductInput {
    if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body)
    ) {
        throw new ProductValidationError(
            "Invalid product data"
        );
    }

    const {
        name,
        category,
        price,
        description,
        sizes,
        stockBySize,
        colors,
    } = body as Record<string, unknown>;

    // --------------------------------------------------
    // NAME
    // --------------------------------------------------

    if (
        typeof name !== "string" ||
        !name.trim()
    ) {
        throw new ProductValidationError(
            "Product name is required"
        );
    }

    // --------------------------------------------------
    // CATEGORY
    // --------------------------------------------------

    if (
        typeof category !== "string" ||
        !category.trim()
    ) {
        throw new ProductValidationError(
            "Category is required"
        );
    }

    // --------------------------------------------------
    // DESCRIPTION
    // --------------------------------------------------

    if (
        typeof description !== "string" ||
        !description.trim()
    ) {
        throw new ProductValidationError(
            "Description is required"
        );
    }

    // --------------------------------------------------
    // PRICE
    // --------------------------------------------------

    const numericPrice = Number(price);

    if (
        !Number.isFinite(numericPrice) ||
        numericPrice < 0
    ) {
        throw new ProductValidationError(
            "Price must be a valid non-negative number"
        );
    }

    // --------------------------------------------------
    // SIZES
    // --------------------------------------------------

    if (
        !Array.isArray(sizes) ||
        sizes.length === 0
    ) {
        throw new ProductValidationError(
            "At least one size is required"
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
        sizes.length
    ) {
        throw new ProductValidationError(
            "Invalid size data"
        );
    }

    if (
        new Set(cleanedSizes).size !==
        cleanedSizes.length
    ) {
        throw new ProductValidationError(
            "Duplicate sizes are not allowed"
        );
    }

    // --------------------------------------------------
    // STOCK
    // --------------------------------------------------

    if (
        !stockBySize ||
        typeof stockBySize !== "object" ||
        Array.isArray(stockBySize)
    ) {
        throw new ProductValidationError(
            "Stock by size is required"
        );
    }

    const cleanedStockBySize: Record<
        string,
        number
    > = {};

    for (const size of cleanedSizes) {
        const stock = Number(
            (stockBySize as Record<string, unknown>)[
                size
            ]
        );

        if (
            !Number.isFinite(stock) ||
            stock < 0 ||
            !Number.isInteger(stock)
        ) {
            throw new ProductValidationError(
                `Invalid stock for size ${size}`
            );
        }

        cleanedStockBySize[size] = stock;
    }

    // --------------------------------------------------
    // COLORS
    // --------------------------------------------------

    if (
        !Array.isArray(colors) ||
        colors.length === 0
    ) {
        throw new ProductValidationError(
            "At least one color is required"
        );
    }

    const cleanedColors: ProductColorInput[] =
        colors.map((color) => {
            if (
                !color ||
                typeof color !== "object" ||
                Array.isArray(color)
            ) {
                throw new ProductValidationError(
                    "Invalid color data"
                );
            }

            const item =
                color as Record<
                    string,
                    unknown
                >;

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
                throw new ProductValidationError(
                    "Every color must have a name"
                );
            }

            if (!colorHex) {
                throw new ProductValidationError(
                    `Hex color is required for ${colorName}`
                );
            }

            if (!imageUrl) {
                throw new ProductValidationError(
                    `Image is required for ${colorName}`
                );
            }

            return {
                name: colorName,
                hex: colorHex,
                imageUrl,
            };
        });

    // --------------------------------------------------
    // DUPLICATE COLORS
    // --------------------------------------------------

    const normalizedColorNames =
        cleanedColors.map((color) =>
            color.name.toLowerCase()
        );

    if (
        new Set(normalizedColorNames).size !==
        normalizedColorNames.length
    ) {
        throw new ProductValidationError(
            "Duplicate colors are not allowed"
        );
    }

    return {
        name: name.trim(),
        category: category.trim(),
        price: numericPrice,
        description: description.trim(),
        sizes: cleanedSizes,
        stockBySize: cleanedStockBySize,
        colors: cleanedColors,
    };
}