/*
  Warnings:

  - Made the column `title` on table `Review` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "title" SET NOT NULL;
