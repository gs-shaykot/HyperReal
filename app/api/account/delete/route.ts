import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const res = await prisma.user.delete({
            where: {
                id: session.user.id,
            },
        });
        
        const sessionDelete = await prisma.session.updateMany({
            where: {
                userId: session.user.id,
            },
            data: {
                sessionRevoked: true,
            }
        });

        return NextResponse.json({ success: true, message: "Account deleted successfully" }, { status: 200 });
    }
    catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}