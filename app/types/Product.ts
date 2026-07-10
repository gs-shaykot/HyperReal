export type wishlist = {
    id: string;
    userId: string;
    productId: string;
    createdAt?: Date;

}

export type product = {
    id: string;
    name: string;
    description: string;
    price: number;
    isAvailable: boolean;
    categoryId: string;
    totalLikes: number;
    totalSold: number;
    createdAt?: Date;
}

export type wishlistWithProduct = wishlist & {
    product: product;
}