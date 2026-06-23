/*
  Warnings:

  - You are about to drop the column `totalAmount` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "totalAmount",
ADD COLUMN     "paidAmountInBDT" DOUBLE PRECISION NOT NULL DEFAULT 0;
