-- Migration: add_record_type_and_citizen_fields
-- Safe: adds new columns with defaults, does not delete or modify existing data.

-- CreateEnum
CREATE TYPE "scheme_record_type" AS ENUM ('CITIZEN_WELFARE_SCHEME', 'BUDGET_ACCOUNTING_ENTRY', 'PENDING_CLASSIFICATION');

-- AlterTable
ALTER TABLE "schemes" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "last_verified_at" TIMESTAMP(3),
ADD COLUMN "official_application_url" TEXT,
ADD COLUMN "plain_language_summary" TEXT,
ADD COLUMN "record_type" "scheme_record_type" NOT NULL DEFAULT 'PENDING_CLASSIFICATION',
ADD COLUMN "required_documents" TEXT,
ADD COLUMN "review_notes" TEXT,
ADD COLUMN "source_title" TEXT,
ADD COLUMN "target_beneficiaries" TEXT,
ADD COLUMN "verification_status" TEXT;

-- CreateIndex
CREATE INDEX "schemes_record_type_idx" ON "schemes"("record_type");

-- CreateIndex
CREATE INDEX "schemes_state_idx" ON "schemes"("state");

