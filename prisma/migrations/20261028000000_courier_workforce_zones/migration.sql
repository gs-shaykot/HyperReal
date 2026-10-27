ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'COURIER';

CREATE TABLE "DeliveryZone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DeliveryZone_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CourierProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courierCode" TEXT NOT NULL,
    "zoneId" TEXT,
    "vehicleType" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CourierProfile_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Shipment" ADD COLUMN "deliveryZoneId" TEXT;

CREATE UNIQUE INDEX "DeliveryZone_name_city_country_key"
    ON "DeliveryZone"("name", "city", "country");
CREATE INDEX "DeliveryZone_city_country_isActive_idx"
    ON "DeliveryZone"("city", "country", "isActive");
CREATE UNIQUE INDEX "CourierProfile_userId_key"
    ON "CourierProfile"("userId");
CREATE UNIQUE INDEX "CourierProfile_courierCode_key"
    ON "CourierProfile"("courierCode");
CREATE INDEX "CourierProfile_zoneId_isActive_idx"
    ON "CourierProfile"("zoneId", "isActive");
CREATE INDEX "Shipment_deliveryZoneId_fulfillmentStatus_idx"
    ON "Shipment"("deliveryZoneId", "fulfillmentStatus");

ALTER TABLE "CourierProfile"
    ADD CONSTRAINT "CourierProfile_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourierProfile"
    ADD CONSTRAINT "CourierProfile_zoneId_fkey"
    FOREIGN KEY ("zoneId") REFERENCES "DeliveryZone"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Shipment"
    ADD CONSTRAINT "Shipment_deliveryZoneId_fkey"
    FOREIGN KEY ("deliveryZoneId") REFERENCES "DeliveryZone"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

