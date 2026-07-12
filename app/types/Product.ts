export type wishlist = {
    id: string;
    userId: string;
    productId: string;
    createdAt?: Date;

}

export type product = {
    id?: string;
    name: string;
    description?: string;
    price?: number;
    isAvailable?: boolean;
    categoryId?: string;
    totalLikes?: number;
    totalSold?: number;
    createdAt?: Date;
}

export type productImages = {
    id: string;
    productId: string;
    imageUrl: string;
    color: string;
}

export type nestedProduct = product & {
    productImages: productImages[],
    category: {
        name: string;
    }
}

export type productVariants = {
    id: string;
    productId: string;
    size: string;
    color: string;
    stock: number;
}

export type wishlistWithProduct = wishlist & {
    product: nestedProduct;
    variant: productVariants;
}