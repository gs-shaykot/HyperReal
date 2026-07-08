/*
  Warnings:

  - A unique constraint covering the columns `[userId,productId]` on the table `Wishlist` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Wishlist_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_userId_productId_key" ON "Wishlist"("userId", "productId");
