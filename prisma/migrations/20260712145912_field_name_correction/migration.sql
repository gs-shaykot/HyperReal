/*
  Warnings:

  - Added the required column `testField` to the `Wishlist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Wishlist" ADD COLUMN     "testField" TEXT NOT NULL;
