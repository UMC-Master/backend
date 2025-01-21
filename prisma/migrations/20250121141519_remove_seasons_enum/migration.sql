/*
  Warnings:

  - You are about to drop the column `category` on the `tip` table. All the data in the column will be lost.
  - You are about to drop the column `seasons` on the `tip` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `tip` DROP COLUMN `category`,
    DROP COLUMN `seasons`;
