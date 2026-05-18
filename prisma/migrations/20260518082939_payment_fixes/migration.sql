-- 0. Ensure enum value exists FIRST (safe)
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'PENDING';

-- 1. Add columns safely (nullable first)
ALTER TABLE "Order"
ADD COLUMN IF NOT EXISTS "address" TEXT,
ADD COLUMN IF NOT EXISTS "orderCode" TEXT;

ALTER TABLE "Payment"
ADD COLUMN IF NOT EXISTS "amount" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 2. Backfill existing data
UPDATE "Order"
SET 
  "address" = COALESCE("address", 'UNKNOWN'),
  "orderCode" = COALESCE("orderCode", gen_random_uuid()::text);

UPDATE "Payment"
SET "amount" = COALESCE("amount", 0);

-- 3. Now enforce NOT NULL (safe now)
ALTER TABLE "Order"
ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "orderCode" SET NOT NULL;

ALTER TABLE "Payment"
ALTER COLUMN "amount" SET NOT NULL;

-- 5. Relax transactionId constraint
ALTER TABLE "Payment"
ALTER COLUMN "transactionId" DROP NOT NULL;

-- 6. Create indexes safely
CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderCode_key" ON "Order"("orderCode");
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_transactionId_key" ON "Payment"("transactionId");