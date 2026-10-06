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
 