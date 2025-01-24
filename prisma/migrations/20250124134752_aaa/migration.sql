/*
  Warnings:

  - The primary key for the `location` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `location_id` on the `location` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `parent_id` on the `location` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `location_id` on the `magazine` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `magazine_hashtag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `magazine_hashtag_id` on the `magazine_hashtag` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `location_id` on the `organization` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `location_id` on the `user` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `location` DROP FOREIGN KEY `location_parent_id_fkey`;

-- DropForeignKey
ALTER TABLE `magazine` DROP FOREIGN KEY `magazine_location_id_fkey`;

-- DropForeignKey
ALTER TABLE `organization` DROP FOREIGN KEY `organization_location_id_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `user_location_id_fkey`;

-- AlterTable
ALTER TABLE `location` DROP PRIMARY KEY,
    MODIFY `location_id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `parent_id` INTEGER NULL,
    ADD PRIMARY KEY (`location_id`);

-- AlterTable
ALTER TABLE `magazine` MODIFY `location_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `magazine_hashtag` DROP PRIMARY KEY,
    MODIFY `magazine_hashtag_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`magazine_hashtag_id`);

-- AlterTable
ALTER TABLE `organization` MODIFY `location_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `location_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `location`(`location_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `location` ADD CONSTRAINT `location_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `location`(`location_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `magazine` ADD CONSTRAINT `magazine_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `location`(`location_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `organization` ADD CONSTRAINT `organization_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `location`(`location_id`) ON DELETE SET NULL ON UPDATE CASCADE;
