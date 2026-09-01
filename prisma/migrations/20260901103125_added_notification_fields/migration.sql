-- AlterTable
ALTER TABLE "user" ADD COLUMN     "marketingNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "orderNotifications" BOOLEAN NOT NULL DEFAULT true;
