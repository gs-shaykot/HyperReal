
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AdminUserSort, AdminUserStatus, getAdminUsers } from "@/utils/AdminUtils/getAdminUsers";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

async function getAdmin() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return null;
    }

    // Check the database role rather than trusting the JWT alone.
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            role: true,
            isBlocked: true,
        },
    });

    if (
        !user ||
        user.role !== "ADMIN" ||
        user.isBlocked
    ) {
        return null;
    }

    return user;
}

export async function GET(req: Request) {
    try {
        const admin = await getAdmin();

        if (!admin) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);


        const search = searchParams.get("search") ?? "";
        const rawRole = searchParams.get("role") ?? "";
        const rawStatus = searchParams.get("status") ?? "ALL";
        const rawSort = searchParams.get("sort") ?? "NEWEST";
        const rawPage = Number(searchParams.get("page") ?? "1");

        let role: Role | undefined;

        if (rawRole && rawRole.toUpperCase() !== "ALL") {
            const normalizedRole = rawRole.toUpperCase();

            const mappedRole =
                normalizedRole === "CUSTOMER"
                    ? "USER"
                    : normalizedRole;

            if (!Object.values(Role).includes(mappedRole as Role)) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Invalid user role",
                    },
                    { status: 400 }
                );
            }

            role = mappedRole as Role;
        }

        const status = rawStatus.toUpperCase();
        const allowedStatuses = ["ALL", "ACTIVE", "BLOCKED"] as const;

        if (!(allowedStatuses as readonly string[]).includes(status)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid user status",
                },
                { status: 400 }
            );
        }


        const sort = rawSort.toUpperCase();
        const allowedSorts = [
            "NEWEST",
            "OLDEST",
            "TOP_SPENDERS",
            "MOST_ORDERS",
            "NAME_A_Z",
        ] as const;

        if (!(allowedSorts as readonly string[]).includes(sort)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid user sort option",
                },
                { status: 400 }
            );
        }

        const data = await getAdminUsers({
            search,
            role,
            status: status as AdminUserStatus,
            sort: sort as AdminUserSort,
            page: Number.isFinite(rawPage)
                ? Math.max(1, Math.floor(rawPage))
                : 1,
        });

        return NextResponse.json(
            { success: true, data },
            { status: 200 }
        );
    } catch (error) {
        console.error("GET /api/admin/users error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch users",
            },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    try {
        const admin = await getAdmin();

        if (!admin) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();

        const { id, role, isBlocked, isCODDisabled } = body;

        if (
            typeof id !== "string" ||
            !id.trim()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User ID is required",
                },
                { status: 400 }
            );
        }

        // Require exactly one supported update.
        const updatesRole = role !== undefined;
        const updatesBlocked = isBlocked !== undefined;
        const updatesCOD = isCODDisabled !== undefined;

        const updateCount = [
            updatesRole,
            updatesBlocked,
            updatesCOD,
        ].filter(Boolean).length;

        if (
            updateCount !== 1 ||
            (updatesRole && typeof role !== "string") ||
            (updatesBlocked && typeof isBlocked !== "boolean") ||
            (updatesCOD && typeof isCODDisabled !== "boolean")
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Provide exactly one valid update: role, isBlocked, or isCODDisabled",
                },
                { status: 400 }
            );
        }


        // Prevent admins from changing their own role or status.
        if (id === admin.id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You cannot change your own role or account status",
                },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                role: true,
            },
        });

        if (!existingUser) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        if (updatesRole && existingUser.role === "COURIER") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Manage courier accounts through Courier Management.",
                },
                { status: 400 }
            );
        }

        const data: {
            role?: Role;
            isBlocked?: boolean;
            isCODDisabled?: boolean;
        } = {};

        if (updatesRole) {
            const normalizedRole = role.toUpperCase();

            const mappedRole =
                normalizedRole === "CUSTOMER"
                    ? "USER"
                    : normalizedRole;

            if (mappedRole === "COURIER") {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Register couriers through Courier Management so a courier profile is created.",
                    },
                    { status: 400 }
                );
            }

            if (
                !Object.values(Role).includes(
                    mappedRole as Role
                )
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Invalid user role",
                    },
                    { status: 400 }
                );
            }

            data.role = mappedRole as Role;
        }

        if (updatesBlocked) {
            data.isBlocked = isBlocked;
        }

        if (updatesCOD) {
            data.isCODDisabled = isCODDisabled;
        }

        // Avoid removing the final administrator.
        if (
            data.role !== undefined &&
            existingUser.role === "ADMIN" &&
            data.role !== "ADMIN"
        ) {
            const adminCount = await prisma.user.count({
                where: { role: "ADMIN" },
            });

            if (adminCount <= 1) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Cannot demote the last administrator",
                    },
                    { status: 409 }
                );
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                PhotoUrl: true,
                role: true,
                isBlocked: true,
                isCODDisabled: true,
                createdAt: true,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "User updated successfully",
                data: updatedUser,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("PATCH /api/admin/users error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to update user",
            },
            { status: 500 }
        );
    }
}
