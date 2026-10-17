-- CreateTable
CREATE TABLE "operational_country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "phoneCode" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "currencySymbol" TEXT NOT NULL,
    "shippingFeeUSD" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "freeShippingThresholdUSD" DOUBLE PRECISION NOT NULL DEFAULT 150,
    "currentExchangeRate" DOUBLE PRECISION,
    "previousExchangeRate" DOUBLE PRECISION,
    "exchangeRateDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operational_country_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "operational_country_code_key" ON "operational_country"("code");
