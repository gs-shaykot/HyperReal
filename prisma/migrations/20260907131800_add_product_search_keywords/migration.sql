-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "searchKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[];
