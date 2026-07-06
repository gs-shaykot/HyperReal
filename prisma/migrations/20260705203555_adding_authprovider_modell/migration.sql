-- AlterTable
ALTER TABLE "user" ADD COLUMN     "authprovider" "AuthProvider" NOT NULL DEFAULT 'EMAIL';
