/*
  Warnings:

  - Added the required column `uploadedBy` to the `ContactDocument` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- First, add the column as nullable
ALTER TABLE "ContactDocument" ADD COLUMN "uploadedBy" INTEGER;

-- Set uploadedBy=4 for all existing rows
UPDATE "ContactDocument" SET "uploadedBy" = 4 WHERE "uploadedBy" IS NULL;

-- Now make the column NOT NULL
ALTER TABLE "ContactDocument" ALTER COLUMN "uploadedBy" SET NOT NULL;
