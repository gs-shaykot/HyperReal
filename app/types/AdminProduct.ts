export type AdminProduct = {
    id: string;
    name: string;
    price: number;
    isAvailable: boolean;
    totalSold: number;
    totalLikes: number;
    createdAt: Date | string;

    category: {
        id: string;
        name: string;
    };

    productImages: {
        imageUrl: string;
    }[];

    productVariants: {
        size: string;
    }[];
};