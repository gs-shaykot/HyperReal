/*
  Warnings:

  - You are about to drop the column `totalAmountInUSD` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "totalAmountInUSD",
ADD COLUMN     "totalProductPriceInUSD" DOUBLE PRECISION NOT NULL DEFAULT 0;
