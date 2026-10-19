
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = {
    params: Promise<{ productId: string }>;
};

const jsonError = (message: string, status: number) =>
    NextResponse.json({ success: false, message }, { status });

export async function GET(
    request: NextRequest,
    { params }: RouteContext
) {
    try {
        const { productId } = await params;
        const ratingParam = request.nextUrl.searchParams.get("rating");
        const sort = request.nextUrl.searchParams.get("sort") ?? "recent";

        const ratingFilter =
            ratingParam && /^[1-5]$/.test(ratingParam)
                ? Number(ratingParam)
                : null;

        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { id: true },
        });

        if (!product) {
            return jsonError("Product not found.", 404);
        }

        const [summary, allReviews, userReview] = await Promise.all([
            prisma.review.aggregate({
                where: { productId },
                _avg: { rating: true },
                _count: { _all: true },
            }),
            prisma.review.findMany({
                where: { productId },
                select: {
                    id: true,
                    rating: true,
                    headline: true,
                    body: true,
                    displayName: true,
                    verifiedPurchase: true,
                    createdAt: true,
                    userId: true,
                    _count: {
                        select: { helpfulVotes: true },
                    },
                    helpfulVotes: userId
                        ? {
                              where: { userId },
                              select: { id: true },
                          }
                        : false,
                },
            }),
            userId
                ? prisma.review.findUnique({
                      where: {
                          userId_productId: { userId, productId },
                      },
                      select: { id: true },
                  })
                : Promise.resolve(null),
        ]);

        const distribution = await prisma.review.groupBy({
            by: ["rating"],
            where: { productId },
            _count: { _all: true },
        });

        const distributionMap = Object.fromEntries(
            distribution.map((item) => [item.rating, item._count._all])
        ) as Record<number, number>;

        let reviews = allReviews.map((review) => ({
            id: review.id,
            rating: review.rating,
            headline: review.headline,
            body: review.body,
            displayName: review.displayName,
            verifiedPurchase: review.verifiedPurchase,
            createdAt: review.createdAt.toISOString(),
            helpfulCount: review._count.helpfulVotes,
            isHelpful:
                Array.isArray(review.helpfulVotes) &&
                review.helpfulVotes.length > 0,
            isOwnReview: review.userId === userId,
        }));

        if (ratingFilter) {
            reviews = reviews.filter(
                (review) => review.rating === ratingFilter
            );
        }

        switch (sort) {
            case "helpful":
                reviews.sort(
                    (a, b) =>
                        b.helpfulCount - a.helpfulCount ||
                        Date.parse(b.createdAt) - Date.parse(a.createdAt)
                );
                break;
            case "highest":
                reviews.sort(
                    (a, b) =>
                        b.rating - a.rating ||
                        Date.parse(b.createdAt) - Date.parse(a.createdAt)
                );
                break;
            case "lowest":
                reviews.sort(
                    (a, b) =>
                        a.rating - b.rating ||
                        Date.parse(b.createdAt) - Date.parse(a.createdAt)
                );
                break;
            default:
                reviews.sort(
                    (a, b) =>
                        Date.parse(b.createdAt) - Date.parse(a.createdAt)
                );
        }

        return NextResponse.json({
            success: true,
            data: {
                averageRating: summary._avg.rating ?? 0,
                totalReviews: summary._count._all,
                distribution: {
                    5: distributionMap[5] ?? 0,
                    4: distributionMap[4] ?? 0,
                    3: distributionMap[3] ?? 0,
                    2: distributionMap[2] ?? 0,
                    1: distributionMap[1] ?? 0,
                },
                userHasReviewed: Boolean(userReview),
                reviews,
            },
        });
    } catch (error) {
        console.error("Fetch product reviews error:", error);
        return jsonError("Could not load product reviews.", 500);
    }
}

export async function POST(
    request: NextRequest,
    { params }: RouteContext
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return jsonError("Please sign in to write a review.", 401);
        }

        const { productId } = await params;
        const body: unknown = await request.json();

        if (typeof body !== "object" || body === null) {
            return jsonError("Invalid review data.", 400);
        }

        const data = body as Record<string, unknown>;
        const rating = data.rating;
        const headline =
            typeof data.headline === "string" ? data.headline.trim() : "";
        const reviewBody =
            typeof data.body === "string" ? data.body.trim() : "";
        const displayName =
            typeof data.displayName === "string"
                ? data.displayName.trim()
                : "";

        if (
            typeof rating !== "number" ||
            !Number.isInteger(rating) ||
            rating < 1 ||
            rating > 5
        ) {
            return jsonError("Choose a rating from 1 to 5 stars.", 400);
        }

        if (!headline || headline.length > 100) {
            return jsonError(
                "A headline is required and must be 100 characters or fewer.",
                400
            );
        }

        if (!reviewBody || reviewBody.length < 10 || reviewBody.length > 3000) {
            return jsonError(
                "Your review must contain between 10 and 3000 characters.",
                400
            );
        }

        if (!displayName || displayName.length > 40) {
            return jsonError(
                "A display name is required and must be 40 characters or fewer.",
                400
            );
        }

        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { id: true },
        });

        if (!product) {
            return jsonError("Product not found.", 404);
        }

        const existingReview = await prisma.review.findUnique({
            where: {
                userId_productId: {
                    userId: session.user.id,
                    productId,
                },
            },
            select: { id: true },
        });

        if (existingReview) {
            return jsonError(
                "You have already reviewed this product.",
                409
            );
        }

        // A verified purchase must be a delivered order containing this product.
        const verifiedPurchase = Boolean(
            await prisma.orderItem.findFirst({
                where: {
                    order: {
                        userId: session.user.id,
                        status: "DELIVERED",
                    },
                    variant: { productId },
                },
                select: { id: true },
            })
        );

        const review = await prisma.review.create({
            data: {
                productId,
                userId: session.user.id,
                rating,
                headline,
                body: reviewBody,
                displayName,
                verifiedPurchase,
            },
            select: { id: true },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Your review has been submitted.",
                data: { id: review.id },
            },
            { status: 201 }
        );
    } catch (error) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002"
        ) {
            return jsonError(
                "You have already reviewed this product.",
                409
            );
        }

        console.error("Create product review error:", error);
        return jsonError("Could not submit your review.", 500);
    }
}
