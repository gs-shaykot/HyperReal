/*
  Warnings:

  - You are about to drop the column `productVariantId` on the `Wishlist` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Wishlist" DROP CONSTRAINT "Wishlist_productVariantId_fkey";

-- AlterTable
ALTER TABLE "Wishlist" DROP COLUMN "productVariantId";
