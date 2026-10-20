
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = {
    params: Promise<{
        productId: string;
        reviewId: string;
    }>;
};

const jsonError = (message: string, status: number) =>
    NextResponse.json({ success: false, message }, { status });

async function getOwnedReview(
    productId: string,
    reviewId: string,
    userId: string
) {
    return prisma.review.findFirst({
        where: {
            id: reviewId,
            productId,
            userId,
        },
        select: {
            id: true,
            userId: true,
        },
    });
}

export async function PATCH(
    request: NextRequest,
    { params }: RouteContext
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return jsonError("Please sign in to edit your review.", 401);
        }

        const { productId, reviewId } = await params;

        const ownedReview = await getOwnedReview(
            productId,
            reviewId,
            session.user.id
        );

        if (!ownedReview) {
            return jsonError(
                "Review not found or you do not have permission to edit it.",
                404
            );
        }

        const payload: unknown = await request.json();

        if (typeof payload !== "object" || payload === null) {
            return jsonError("Invalid review data.", 400);
        }

        const data = payload as Record<string, unknown>;

        const rating = data.rating;
        const headline =
            typeof data.headline === "string" ? data.headline.trim() : "";
        const body =
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

        if (body.length < 10 || body.length > 3000) {
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

        await prisma.review.update({
            where: { id: ownedReview.id },
            data: {
                rating,
                headline,
                body,
                displayName,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Your review has been updated.",
        });
    } catch (error) {
        console.error("Update product review error:", error);

        return jsonError("Could not update your review.", 500);
    }
}

export async function DELETE(
    _request: Request,
    { params }: RouteContext
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return jsonError("Please sign in to delete your review.", 401);
        }

        const { productId, reviewId } = await params;

        const ownedReview = await getOwnedReview(
            productId,
            reviewId,
            session.user.id
        );

        if (!ownedReview) {
            return jsonError(
                "Review not found or you do not have permission to delete it.",
                404
            );
        }

        await prisma.review.delete({
            where: { id: ownedReview.id },
        });

        return NextResponse.json({
            success: true,
            message: "Your review has been deleted.",
        });
    } catch (error) {
        console.error("Delete product review error:", error);

        return jsonError("Could not delete your review.", 500);
    }
}
