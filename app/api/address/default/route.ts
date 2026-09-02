import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
    try {
        const { id } = await req.json();
        const session = await getServerSession(authOptions);

        if (!session?.user.id || !session.sessionId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const address = await tx.address.findFirst({
                where: {
                    id,
                    userId: session?.user.id
                },
                select: {
                    id: true
                }
            });

            if (!address) {
                return { count: 0 };
            }

            await tx.address.updateMany({
                where: {
                    userId: session?.user.id,
                },
                data: {
                    isDefault: false
                }
            });

            return await tx.address.updateMany({
                where: { id, userId: session?.user.id },
                data: {
                    isDefault: true
                }
            })

        });

        if (result.count === 0) {
            return NextResponse.json({ message: "Address not found or not authorized to update." }, { status: 404 });
        }

        return NextResponse.json({ message: "Address updated successfully." }, { status: 200 });
    }
    catch (error) {
        console.error("Error occurred while updating address: ", error);
        return NextResponse.json({ message: "Error occurred while updating address." }, { status: 500 });
    }
}