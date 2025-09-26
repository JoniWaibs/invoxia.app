/*
  Warnings:

  - You are about to drop the `health` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('DNI', 'CUIT', 'CUIL');

-- DropTable
DROP TABLE "public"."health";

-- CreateTable
CREATE TABLE "public"."contacts" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "docType" "public"."DocumentType" NOT NULL,
    "docNumber" TEXT NOT NULL,
    "email" TEXT,
    "whatsapp" TEXT,
    "ivaCondition" "public"."AFIPCondition",
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contacts_tenantId_docType_docNumber_key" ON "public"."contacts"("tenantId", "docType", "docNumber");

-- AddForeignKey
ALTER TABLE "public"."contacts" ADD CONSTRAINT "contacts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
