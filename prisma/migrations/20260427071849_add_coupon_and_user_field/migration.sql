-- AlterTable
ALTER TABLE "user" ADD COLUMN     "isNewUser" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "minSpend" DOUBLE PRECISION NOT NULL,
    "maxDiscount" DOUBLE PRECISION,
    "newUserOnly" BOOLEAN,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");
