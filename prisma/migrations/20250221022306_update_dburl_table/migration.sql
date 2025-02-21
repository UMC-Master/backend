-- DropIndex
DROP INDEX `idx_content` ON `tip`;

-- AlterTable
ALTER TABLE `magazine` MODIFY `policy_url` TEXT NULL;

-- AlterTable
ALTER TABLE `magazine_image` MODIFY `image_url` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `organization` MODIFY `photo_url` TEXT NULL,
    MODIFY `homepage_url` TEXT NULL;

-- AlterTable
ALTER TABLE `tip_media` MODIFY `media_url` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `profile_image_url` TEXT NULL;
