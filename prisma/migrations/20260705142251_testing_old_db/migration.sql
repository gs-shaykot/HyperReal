/*
  Warnings:

  - You are about to drop the column `fullName` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `isDefault` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `testMigration` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "address" DROP COLUMN "fullName",
DROP COLUMN "isDefault",
DROP COLUMN "label";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "phone",
DROP COLUMN "testMigration";
