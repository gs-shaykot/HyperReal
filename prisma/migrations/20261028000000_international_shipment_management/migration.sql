ALTER TABLE "Shipment"
  ADD COLUMN "shippingType" TEXT NOT NULL DEFAULT 'DOMESTIC',
  ADD COLUMN "carrierName" TEXT,
  ADD COLUMN "carrierTrackingNumber" TEXT,
  ADD COLUMN "estimatedDeliveryAt" TIMESTAMP(3),
  ADD COLUMN "customsStatus" TEXT NOT NULL DEFAULT 'NOT_REQUIRED',
  ADD COLUMN "internationalNotes" TEXT;
