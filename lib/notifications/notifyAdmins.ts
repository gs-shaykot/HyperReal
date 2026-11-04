import prisma from "@/lib/prisma";

/**
 * Fan out an admin event to every active ADMIN account.
 * Notifications are persisted per admin so each admin has independent read state.
 */
export async function notifyAdmins(input: {
  type: "ADMIN_NEW_USER" | "ADMIN_NEW_ORDER" | "ADMIN_NEW_FULFILLMENT" | "ADMIN_NEW_INTERNATIONAL_SHIPMENT";
  title: string;
  message: string;
  href: string;
  metadata?: Record<string, unknown>;
}) {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", isBlocked: false },
    select: { id: true },
  });

  if (!admins.length) return;

  await prisma.notification.createMany({
    data: admins.map(({ id }) => ({
      userId: id,
      type: input.type,
      title: input.title,
      message: input.message,
      href: input.href,
      ...(input.metadata ? { metadata: input.metadata as object } : {}),
    })),
  });
}
