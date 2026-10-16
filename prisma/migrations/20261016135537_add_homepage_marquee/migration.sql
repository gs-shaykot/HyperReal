/*
  Warnings:

  - You are about to drop the `OperationalCountry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StoreSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "OperationalCountry";

-- DropTable
DROP TABLE "StoreSettings";

-- CreateTable
CREATE TABLE "homepage_marquee" (
    "id" TEXT NOT NULL DEFAULT 'homepage',
    "messages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "scrollSpeed" INTEGER NOT NULL DEFAULT 45,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_marquee_pkey" PRIMARY KEY ("id")
);
