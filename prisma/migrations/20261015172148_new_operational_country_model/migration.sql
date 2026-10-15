/*
  Warnings:

  - Added the required column `phoneCode` to the `OperationalCountry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OperationalCountry" ADD COLUMN     "currentExchangeRate" DOUBLE PRECISION,
ADD COLUMN     "exchangeRateDate" TIMESTAMP(3),
ADD COLUMN     "phoneCode" TEXT NOT NULL,
ADD COLUMN     "previousExchangeRate" DOUBLE PRECISION;
