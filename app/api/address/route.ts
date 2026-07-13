import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const address = await req.json();
        const session = await getServerSession(authOptions); 
        const res = await prisma.address.create({
            data: {
                userId: session?.user.id, 
                ...address
            }
        })

        return NextResponse.json({ message: "Address added successfully.", data: res }, { status: 200 });
    }
    catch (error) {
        console.error("Error occurred while adding address: ", error);
        return NextResponse.json({ message: "Error occurred while adding address." }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const res = await prisma.address.findMany({
            where: {
                userId: session?.user.id
            }
        });
        return NextResponse.json({ message: "Addresses fetched successfully.", data: res }, { status: 200 });
    }
    catch (error) {
        console.error("Error occurred while fetching addresses: ", error);
        return NextResponse.json({ message: "Error occurred while fetching addresses." }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        const session = await getServerSession(authOptions);
        const res = await prisma.address.delete({
            where: {
                id,
                userId: session?.user.id
            }
        });
        return NextResponse.json({ message: "Address deleted successfully.", data: res }, { status: 200 });
    }
    catch (error) {
        console.error("Error occurred while deleting address: ", error);
        return NextResponse.json({ message: "Error occurred while deleting address." }, { status: 500 });
    }
}