import argon2 from "argon2";
import { AuthProvider, FulfillmentStatus, OrderStatus, PaymentMethod, PaymentStatus, PrismaClient, ShipmentStatus, TrackingEventType, Role } from "@prisma/client";

const DEMO_COURIER_PASSWORD = "CourierDemo@2026";

const zones = [
    { name: "Dhaka North", city: "Dhaka", country: "Bangladesh" },
    { name: "Dhaka South", city: "Dhaka", country: "Bangladesh" },
    { name: "Chattogram Central", city: "Chattogram", country: "Bangladesh" },
    { name: "Cumilla Central", city: "Cumilla", country: "Bangladesh" },
];

const couriers = [
    { id: "66666666-6666-4666-8666-666666666601", name: "Daniel Ahmed", email: "courier.daniel@hyperreal.demo", phone: "+8801700000601", courierCode: "HRC-DHK-001", vehicleType: "Motorcycle", zoneName: "Dhaka North" },
    { id: "66666666-6666-4666-8666-666666666602", name: "Sophia Rahman", email: "courier.sophia@hyperreal.demo", phone: "+8801700000602", courierCode: "HRC-DHK-002", vehicleType: "Motorcycle", zoneName: "Dhaka South" },
    { id: "66666666-6666-4666-8666-666666666603", name: "Oliver Hasan", email: "courier.oliver@hyperreal.demo", phone: "+8801700000603", courierCode: "HRC-CTG-001", vehicleType: "Delivery Van", zoneName: "Chattogram Central" },
];

const addressSamples = [
    { fullName: "Arman Hossain", street: "Road 12, Banani", house: "House 18", city: "Dhaka", zipCode: "1213", country: "Bangladesh", phone: "+8801790000001" },
    { fullName: "Mim Akter", street: "Dhanmondi Road 8", house: "Apartment 4B", city: "Dhaka", zipCode: "1209", country: "Bangladesh", phone: "+8801790000002" },
    { fullName: "Fahim Rahman", street: "GEC Circle", house: "Building 7", city: "Chattogram", zipCode: "4000", country: "Bangladesh", phone: "+8801790000003" },
    { fullName: "Nabila Islam", street: "Kandirpar Main Road", house: "House 22", city: "Cumilla", zipCode: "3500", country: "Bangladesh", phone: "+8801790000004" },
];

export async function seedCourierDemoData(prisma: PrismaClient) {
    console.log("Seeding English courier and delivery-zone demo data...");

    for (const zone of zones) {
        await prisma.deliveryZone.upsert({
            where: { name_city_country: zone },
            update: { isActive: true },
            create: zone,
        });
    }

    const password = await argon2.hash(DEMO_COURIER_PASSWORD);
    const courierIds: string[] = [];

    for (const courier of couriers) {
        const zone = zones.find((item) => item.name === courier.zoneName)!;
        const savedUser = await prisma.user.upsert({
            where: { email: courier.email },
            update: {
                name: courier.name,
                role: Role.COURIER,
                isBlocked: false,
                isVerified: true,
                isNewUser: false,
                phone: courier.phone,
                authProvider: AuthProvider.EMAIL,
            },
            create: {
                id: courier.id,
                name: courier.name,
                email: courier.email,
                password,
                role: Role.COURIER,
                isBlocked: false,
                isVerified: true,
                isNewUser: false,
                phone: courier.phone,
                PhotoUrl: "",
                authProvider: AuthProvider.EMAIL,
            },
        });

        const savedZone = await prisma.deliveryZone.findUniqueOrThrow({
            where: { name_city_country: { name: zone.name, city: zone.city, country: zone.country } },
        });

        await prisma.courierProfile.upsert({
            where: { userId: savedUser.id },
            update: {
                courierCode: courier.courierCode,
                zoneId: savedZone.id,
                vehicleType: courier.vehicleType,
                isActive: true,
            },
            create: {
                userId: savedUser.id,
                courierCode: courier.courierCode,
                zoneId: savedZone.id,
                vehicleType: courier.vehicleType,
                isActive: true,
            },
        });
        courierIds.push(savedUser.id);
    }

    const demoOrders = await prisma.order.findMany({
        where: { orderCode: { startsWith: "HYP-OCT-" }, status: { not: OrderStatus.CANCELLED } },
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true, phone: true } }, orderHistory: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    let shipmentCount = 0;
    for (let index = 0; index < demoOrders.length; index++) {
        const order = demoOrders[index];
        const address = addressSamples[index % addressSamples.length];
        if (!order.orderHistory) {
            await prisma.orderHistory.create({
                data: {
                    orderId: order.id,
                    ...address,
                    fullName: order.user.name || address.fullName,
                    phone: order.user.phone || address.phone,
                },
            });
        }

        const existingShipment = await prisma.shipment.findUnique({
            where: { orderId: order.id },
            select: { id: true },
        });
        if (existingShipment) continue;

        const zoneName = address.city === "Chattogram"
            ? "Chattogram Central"
            : address.city === "Cumilla"
                ? "Cumilla Central"
                : index % 2 === 0 ? "Dhaka North" : "Dhaka South";
        const zone = zones.find((item) => item.name === zoneName)!;
        const savedZone = await prisma.deliveryZone.findUniqueOrThrow({
            where: { name_city_country: { name: zone.name, city: zone.city, country: zone.country } },
        });

        const isDelivered = order.status === OrderStatus.DELIVERED;
        const isShipped = order.status === OrderStatus.SHIPPED;
        const shouldDispatch = isDelivered || isShipped;
        const status = isDelivered
            ? ShipmentStatus.DELIVERED
            : isShipped
                ? ShipmentStatus.OUT_FOR_DELIVERY
                : ShipmentStatus.PENDING;
        const courierId = shouldDispatch
            ? address.city === "Chattogram" ? courierIds[2] : index % 2 === 0 ? courierIds[0] : courierIds[1]
            : null;
        const timestamp = order.createdAt;

        const shipment = await prisma.shipment.create({
            data: {
                orderId: order.id,
                status,
                fulfillmentStatus: shouldDispatch ? FulfillmentStatus.DISPATCHED : FulfillmentStatus.READY_TO_PACK,
                assignedCourierId: courierId,
                deliveryZoneId: savedZone.id,
                dispatchedAt: shouldDispatch ? new Date(timestamp.getTime() + 60 * 60 * 1000) : null,
                deliveredAt: isDelivered ? new Date(timestamp.getTime() + 4 * 60 * 60 * 1000) : null,
                codCollected: isDelivered && order.payments[0]?.method === PaymentMethod.COD,
                codCollectedAt: isDelivered && order.payments[0]?.method === PaymentMethod.COD
                    ? new Date(timestamp.getTime() + 4 * 60 * 60 * 1000)
                    : null,
                deliveryAttempts: order.status === OrderStatus.PENDING ? 0 : 1,
            },
        });

        if (shouldDispatch) {
            await prisma.orderTrackingEvent.create({
                data: {
                    orderId: order.id,
                    shipmentId: shipment.id,
                    actorId: courierId,
                    type: isDelivered ? TrackingEventType.DELIVERED : TrackingEventType.OUT_FOR_DELIVERY,
                    title: isDelivered ? "Delivered successfully" : "Out for delivery",
                    description: isDelivered
                        ? "Demo delivery completed successfully."
                        : "Demo parcel assigned to a courier and out for delivery.",
                    createdAt: isDelivered
                        ? new Date(timestamp.getTime() + 4 * 60 * 60 * 1000)
                        : new Date(timestamp.getTime() + 60 * 60 * 1000),
                    metadata: { demo: true },
                },
            });
        }
        shipmentCount++;
    }

    console.log(`Courier demo data ready: ${zones.length} delivery zones, ${couriers.length} couriers, ${shipmentCount} new shipments.`);
    console.log(`Demo courier password: ${DEMO_COURIER_PASSWORD}`);
}
