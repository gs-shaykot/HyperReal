import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
    try {
        const { id } = await req.json();
        const session = await getServerSession(authOptions);

        await prisma.$transaction(async (tx) => {
            // set all addresses of the user to isDefault: false except the id'th address.
            tx.address.updateMany({
                where: {
                    userId: session?.user.id,
                    // NOT: {
                    //     id
                    // }
                },
                data: {
                    isDefault: false
                }
            });

            // Make the "id" address the default address
            tx.address.update({
                where: { id },
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