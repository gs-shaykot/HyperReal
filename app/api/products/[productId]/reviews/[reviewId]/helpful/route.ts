
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = {
    params: Promise<{ productId: string; reviewId: string }>;
};

export async function POST(
    _request: Request,
    { params }: RouteContext
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, message: "Please sign in to vote." },
                { status: 401 }
            );
        }

        const { productId, reviewId } = await params;

        const review = await prisma.review.findFirst({
            where: { id: reviewId, productId },
            select: { id: true, userId: true },
        });

        if (!review) {
            return NextResponse.json(
                { success: false, message: "Review not found." },
                { status: 404 }
            );
        }

        if (review.userId === session.user.id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You cannot vote on your own review.",
                },
                { status: 400 }
            );
        }

        const existingVote = await prisma.reviewHelpfulVote.findUnique({
            where: {
                reviewId_userId: {
                    reviewId,
                    userId: session.user.id,
                },
            },
            select: { id: true },
        });

        if (existingVote) {
            await prisma.reviewHelpfulVote.delete({
                where: { id: existingVote.id },
            });
        } else {
            await prisma.reviewHelpfulVote.create({
                data: {
                    reviewId,
                    userId: session.user.id,
                },
            });
        }

        const helpfulCount = await prisma.reviewHelpfulVote.count({
            where: { reviewId },
        });

        return NextResponse.json({
            success: true,
            isHelpful: !existingVote,
            helpfulCount,
        });
    } catch (error) {
        console.error("Toggle helpful review vote error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Could not update your vote.",
            },
            { status: 500 }
        );
    }
}
