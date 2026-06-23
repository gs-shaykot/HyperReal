/*
  Warnings:

  - You are about to drop the column `discount` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `totalProductPriceInUSD` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "discount",
DROP COLUMN "totalAmount",
DROP COLUMN "totalProductPriceInUSD";
