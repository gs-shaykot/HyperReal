/*
  Warnings:

  - Added the required column `country` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "country" TEXT NOT NULL;
