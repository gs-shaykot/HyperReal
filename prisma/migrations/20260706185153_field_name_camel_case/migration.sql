/*
  Warnings:

  - You are about to drop the column `authprovider` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "authprovider",
ADD COLUMN     "authProvider" "AuthProvider" NOT NULL DEFAULT 'EMAIL';
