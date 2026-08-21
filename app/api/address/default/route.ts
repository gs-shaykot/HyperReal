import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
    try {
        const { id } = await req.json();
        const session = await getServerSession(authOptions);

        if (!session?.user.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        await prisma.$transaction(async (tx) => {
            
            await tx.address.updateMany({
                where: {
                    userId: session?.user.id,
                },
                data: {
                    isDefault: false
                }
            });
            
            await tx.address.updateMany({
                where: { id, userId: session?.user.id },
                data: {
                    isDefault: true
                }
            })
        });

        return NextResponse.json({ message: "Address updated successfully." }, { status: 200 });
    }
    catch (error) {
        console.error("Error occurred while updating address: ", error);
        return NextResponse.json({ message: "Error occurred while updating address." }, { status: 500 });
    }
}