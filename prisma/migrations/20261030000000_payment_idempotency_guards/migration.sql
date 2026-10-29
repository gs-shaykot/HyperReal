ALTER TABLE "Order"
  ADD COLUMN "checkoutKey" TEXT,
  ADD COLUMN "checkoutFingerprint" TEXT;

CREATE UNIQUE INDEX "Order_checkoutKey_key" ON "Order"("checkoutKey");

ALTER TABLE "Payment"
  ADD COLUMN "checkoutUrl" TEXT;

CREATE TABLE "StripeWebhookEvent" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StripeWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StripeWebhookEvent_processedAt_idx"
  ON "StripeWebhookEvent"("processedAt");
