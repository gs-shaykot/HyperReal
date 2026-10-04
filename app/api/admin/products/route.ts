import { authOptions } from "@/lib/auth";
import { getAdminProducts } from "@/utils/AdminUtils/getAdminProducts";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (
            !session?.user ||
            session.user.role !== "ADMIN"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        const { searchParams } = new URL(req.url);

        const search =
            searchParams.get("search") ?? "";

        const categoryId =
            searchParams.get("category") ?? undefined;

        const requestedPage =
            Number(searchParams.get("page") ?? "1");

        const page =
            Number.isFinite(requestedPage) &&
                requestedPage > 0
                ? requestedPage
                : 1;

        const data = await getAdminProducts({
            search,
            categoryId,
            page,
        });

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(
            "Admin products API error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch products",
            },
            {
                status: 500,
            }
        );
    }
}