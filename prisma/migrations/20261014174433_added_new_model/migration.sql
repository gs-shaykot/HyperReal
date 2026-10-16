-- CreateTable
CREATE TABLE "StoreSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "storeName" TEXT NOT NULL DEFAULT 'HYPERREAL',
    "supportEmail" TEXT NOT NULL DEFAULT 'support@hyperreal.store',
    "showMarquee" BOOLEAN NOT NULL DEFAULT true,
    "marqueeMessages" TEXT[] DEFAULT ARRAY['FREE SHIPPING WORLDWIDE', 'DROP 004 AVAILABLE NOW', 'LIMITED STOCK']::TEXT[],
    "marqueeScrollSpeed" INTEGER NOT NULL DEFAULT 45,
    "showUpcomingRelease" BOOLEAN NOT NULL DEFAULT true,
    "releaseNameLine1" TEXT NOT NULL DEFAULT 'Void',
    "releaseNameLine2" TEXT NOT NULL DEFAULT 'Runner',
    "releaseVersion" TEXT NOT NULL DEFAULT 'V3',
    "releaseDescription" TEXT NOT NULL DEFAULT 'The next iteration of urban mobility.',
    "releaseCountdownEnds" TIMESTAMP(3),
    "releaseButtonLabel" TEXT NOT NULL DEFAULT 'Set Reminder',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationalCountry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "currencySymbol" TEXT NOT NULL,
    "shippingFeeUSD" DOUBLE PRECISION NOT NULL,
    "freeShippingThresholdUSD" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationalCountry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OperationalCountry_code_key" ON "OperationalCountry"("code");
