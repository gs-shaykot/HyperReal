export type AdminProduct = {
    id: string;

    name: string;
    description: string;
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
        color: string | null;
    }[];

    productVariants: {
        id: string;
        size: string;
        color: string;
        stock: number;
        hex: string | null;
    }[];
};