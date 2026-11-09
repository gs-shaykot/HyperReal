import { getAdminUser } from "@/lib/auth/getAdminUser";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

async function adminId() { return (await getAdminUser())?.id ?? null;

export async function GET() {
  const userId = await adminId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized." },
      { status: 401 },
    );
  }

  const [orders, users, fulfillment, international, notifications] = await Promise.all([
    prisma.notification.count({
      where: { userId, type: "ADMIN_NEW_ORDER", readAt: null },
    }),
    prisma.notification.count({
      where: { userId, type: "ADMIN_NEW_USER", readAt: null },
    }),
    prisma.notification.count({
      where: { userId, type: "ADMIN_NEW_FULFILLMENT", readAt: null },
    }),
    prisma.notification.count({
      where: {
        userId,
        type: "ADMIN_NEW_INTERNATIONAL_SHIPMENT",
        readAt: null,
      },
    }),
    prisma.notification.findMany({
      where: {
        userId,
        type: {
          in: [
            "ADMIN_NEW_ORDER",
            "ADMIN_NEW_USER",
            "ADMIN_NEW_FULFILLMENT",
            "ADMIN_NEW_INTERNATIONAL_SHIPMENT",
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        href: true,
        readAt: true,
        createdAt: true,
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      counts: {
        orders,
        users,
        fulfillment,
        international,
        total: orders + users + fulfillment + international,
      },
      notifications,
    },
  });
}

export async function PATCH(request: Request) {
  const userId = await adminId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized." },
      { status: 401 },
    );
  }

  const body = (await request
    .json()
    .catch(() => null)) as {
    category?: unknown;
    notificationId?: unknown;
    markAll?: unknown;
  } | null;

  if (
    !body ||
    (typeof body.notificationId !== "string" &&
      body.category !== "orders" &&
      body.category !== "users" &&
      body.category !== "fulfillment" &&
      body.category !== "international" &&
      body.markAll !== true)
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "A notification ID or valid category is required.",
      },
      { status: 400 },
    );
  }

  const typeByCategory = {
    orders: "ADMIN_NEW_ORDER",
    users: "ADMIN_NEW_USER",
  } as const;

  const where =
    body.markAll === true
      ? {
          userId,
          type: { in: Object.values(typeByCategory) },
          readAt: null,
        }
      : typeof body.notificationId === "string"
        ? { userId, id: body.notificationId, readAt: null }
        : {
            userId,
            type: typeByCategory[body.category as keyof typeof typeByCategory],
            readAt: null,
          };

  await prisma.notification.updateMany({ where, data: { readAt: new Date() } });
  return NextResponse.json({ success: true });
}