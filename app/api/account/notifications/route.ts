import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

async function customerId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.sessionRevoked) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, isBlocked: true } });
  return user && !user.isBlocked ? user.id : null;
}

export async function GET() {
  const userId = await customerId();
  if (!userId) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 25, select: { id: true, type: true, title: true, message: true, href: true, readAt: true, createdAt: true } }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);
  return NextResponse.json({ success: true, data: items, unreadCount });
}

export async function PATCH(request: Request) {
  const userId = await customerId();
  if (!userId) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  const body = await request.json().catch(() => null) as { notificationId?: unknown; markAll?: unknown } | null;
  if (!body || (body.markAll !== true && typeof body.notificationId !== "string")) {
    return NextResponse.json({ success: false, message: "A notification ID or markAll=true is required." }, { status: 400 });
  }
  const where = body.markAll === true
    ? { userId, readAt: null }
    : { id: body.notificationId as string, userId, readAt: null };
  await prisma.notification.updateMany({ where, data: { readAt: new Date() } });
  return NextResponse.json({ success: true, message: "Notification read state updated." });
}
