/*
  Warnings:

  - A unique constraint covering the columns `[whatsappNumber,tenantId,email]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."users_whatsappNumber_tenantId_key";

-- CreateIndex
CREATE UNIQUE INDEX "users_whatsappNumber_tenantId_email_key" ON "public"."users"("whatsappNumber", "tenantId", "email");
