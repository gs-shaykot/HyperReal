/*
  Warnings:

  - Added the required column `productVariantId` to the `Wishlist` table without a default value. This is not possible if the table is not empty.

*/
-- Add the column without a constraint so existing wishlist rows can be backfilled.
ALTER TABLE "Wishlist" ADD COLUMN "productVariantId" TEXT;

-- The previous migration removed the original variant values. Choose a stable
-- replacement variant for each product before enforcing the required relation.
WITH selected_variants AS (
  SELECT DISTINCT ON ("productId") "productId", "id"
  FROM "ProductVariant"
  ORDER BY "productId", "id"
)
UPDATE "Wishlist" AS wishlist
SET "productVariantId" = selected_variants."id"
FROM selected_variants
WHERE wishlist."productId" = selected_variants."productId";

ALTER TABLE "Wishlist" ALTER COLUMN "productVariantId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
