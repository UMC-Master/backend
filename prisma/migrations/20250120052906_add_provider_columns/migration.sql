/*
  Warnings:

  - A unique constraint covering the columns `[providerId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `provider` VARCHAR(191) NOT NULL DEFAULT 'local',
    ADD COLUMN `providerId` VARCHAR(191) NULL,
    MODIFY `password` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `user_providerId_key` ON `user`(`providerId`);
