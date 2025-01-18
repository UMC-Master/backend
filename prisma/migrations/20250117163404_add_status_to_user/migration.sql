/*
  Warnings:

  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Hashtag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Log` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Magazine` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MagazineBookmark` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MagazineHashtag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MagazineImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MagazineLike` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Organization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Quiz` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuizAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SocialAccount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tip` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TipHashtag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TipLike` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TipMedia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TipSave` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserActivityType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserStatistic` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Comment` DROP FOREIGN KEY `Comment_tips_id_fkey`;

-- DropForeignKey
ALTER TABLE `Location` DROP FOREIGN KEY `Location_parent_id_fkey`;

-- DropForeignKey
ALTER TABLE `Log` DROP FOREIGN KEY `Log_user_activity_type_id_fkey`;

-- DropForeignKey
ALTER TABLE `Magazine` DROP FOREIGN KEY `Magazine_location_id_fkey`;

-- DropForeignKey
ALTER TABLE `Magazine` DROP FOREIGN KEY `Magazine_organization_id_fkey`;

-- DropForeignKey
ALTER TABLE `MagazineBookmark` DROP FOREIGN KEY `MagazineBookmark_magazine_id_fkey`;

-- DropForeignKey
ALTER TABLE `MagazineHashtag` DROP FOREIGN KEY `MagazineHashtag_hashtag_id_fkey`;

-- DropForeignKey
ALTER TABLE `MagazineHashtag` DROP FOREIGN KEY `MagazineHashtag_magazine_id_fkey`;

-- DropForeignKey
ALTER TABLE `MagazineImage` DROP FOREIGN KEY `MagazineImage_magazine_id_fkey`;

-- DropForeignKey
ALTER TABLE `MagazineLike` DROP FOREIGN KEY `MagazineLike_magazine_id_fkey`;

-- DropForeignKey
ALTER TABLE `Notification` DROP FOREIGN KEY `Notification_Comment_fkey`;

-- DropForeignKey
ALTER TABLE `Notification` DROP FOREIGN KEY `Notification_Tip_fkey`;

-- DropForeignKey
ALTER TABLE `Organization` DROP FOREIGN KEY `Organization_location_id_fkey`;

-- DropForeignKey
ALTER TABLE `QuizAnswer` DROP FOREIGN KEY `QuizAnswer_quiz_id_fkey`;

-- DropForeignKey
ALTER TABLE `TipHashtag` DROP FOREIGN KEY `TipHashtag_hashtag_id_fkey`;

-- DropForeignKey
ALTER TABLE `TipHashtag` DROP FOREIGN KEY `TipHashtag_tips_id_fkey`;

-- DropForeignKey
ALTER TABLE `TipLike` DROP FOREIGN KEY `TipLike_tips_id_fkey`;

-- DropForeignKey
ALTER TABLE `TipMedia` DROP FOREIGN KEY `TipMedia_tips_id_fkey`;

-- DropForeignKey
ALTER TABLE `TipSave` DROP FOREIGN KEY `TipSave_tips_id_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_location_id_fkey`;

-- DropIndex
DROP INDEX `User_location_id_fkey` ON `user`;

-- AlterTable
ALTER TABLE `user` MODIFY `email` VARCHAR(191) NULL,
    MODIFY `nickname` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `Comment`;

-- DropTable
DROP TABLE `Hashtag`;

-- DropTable
DROP TABLE `Location`;

-- DropTable
DROP TABLE `Log`;

-- DropTable
DROP TABLE `Magazine`;

-- DropTable
DROP TABLE `MagazineBookmark`;

-- DropTable
DROP TABLE `MagazineHashtag`;

-- DropTable
DROP TABLE `MagazineImage`;

-- DropTable
DROP TABLE `MagazineLike`;

-- DropTable
DROP TABLE `Notification`;

-- DropTable
DROP TABLE `Organization`;

-- DropTable
DROP TABLE `Quiz`;

-- DropTable
DROP TABLE `QuizAnswer`;

-- DropTable
DROP TABLE `SocialAccount`;

-- DropTable
DROP TABLE `Tip`;

-- DropTable
DROP TABLE `TipHashtag`;

-- DropTable
DROP TABLE `TipLike`;

-- DropTable
DROP TABLE `TipMedia`;

-- DropTable
DROP TABLE `TipSave`;

-- DropTable
DROP TABLE `UserActivityType`;

-- DropTable
DROP TABLE `UserStatistic`;

-- CreateTable
CREATE TABLE `location` (
    `location_id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `parent_id` BIGINT NULL,
    `created_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`location_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tip` (
    `tips_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `seasons` ENUM('SPRING', 'SUMMER', 'FALL', 'WINTER') NULL,

    PRIMARY KEY (`tips_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tip_media` (
    `media_id` INTEGER NOT NULL AUTO_INCREMENT,
    `tips_id` INTEGER NOT NULL,
    `media_url` VARCHAR(191) NOT NULL,
    `media_type` ENUM('image', 'video') NOT NULL,
    `uploaded_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`media_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tip_save` (
    `save_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `tips_id` INTEGER NOT NULL,
    `scraped_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`save_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `social_account` (
    `social_id` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `provider` ENUM('KAKAO') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`social_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comment` (
    `comment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `tips_id` INTEGER NOT NULL,
    `comment` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`comment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `type` ENUM('LIKE', 'SCRAP', 'COMMENT', 'REPLY') NOT NULL,
    `user_id` INTEGER NOT NULL,
    `trigger_user_id` INTEGER NOT NULL,
    `tips_id` INTEGER NULL,
    `comment_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tip_like` (
    `like_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `tips_id` INTEGER NOT NULL,
    `liked_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`like_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_statistic` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `quiz_score` INTEGER NOT NULL DEFAULT 0,
    `tips_shared_count` INTEGER NOT NULL DEFAULT 0,
    `likes_received` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_statistic_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quiz` (
    `quiz_id` INTEGER NOT NULL AUTO_INCREMENT,
    `question` VARCHAR(191) NOT NULL,
    `correct_answer` VARCHAR(191) NOT NULL,
    `quiz_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`quiz_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quiz_answer` (
    `answer_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `quiz_id` INTEGER NOT NULL,
    `submitted_answer` ENUM('O', 'X') NOT NULL,
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`answer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hashtag` (
    `hashtag_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `hashtag_type_id` INTEGER NOT NULL,

    PRIMARY KEY (`hashtag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hashtag_type` (
    `hashtag_type_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`hashtag_type_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tip_hashtag` (
    `tips_hashtag_id` INTEGER NOT NULL AUTO_INCREMENT,
    `tips_id` INTEGER NOT NULL,
    `hashtag_id` INTEGER NOT NULL,

    PRIMARY KEY (`tips_hashtag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `magazine` (
    `magazine_id` INTEGER NOT NULL AUTO_INCREMENT,
    `organization_id` INTEGER NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,
    `policy_url` VARCHAR(191) NULL,
    `location_id` BIGINT NULL,

    PRIMARY KEY (`magazine_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `magazine_hashtag` (
    `magazine_hashtag_id` BIGINT NOT NULL AUTO_INCREMENT,
    `hashtag_id` INTEGER NULL,
    `magazine_id` INTEGER NULL,

    PRIMARY KEY (`magazine_hashtag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `magazine_image` (
    `magazine_photo_id` INTEGER NOT NULL AUTO_INCREMENT,
    `image_url` VARCHAR(191) NOT NULL,
    `magazine_id` INTEGER NOT NULL,

    PRIMARY KEY (`magazine_photo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `magazine_like` (
    `magazine_like_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `magazine_id` INTEGER NOT NULL,

    PRIMARY KEY (`magazine_like_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `magazine_bookmark` (
    `magazine_bookmark_id` INTEGER NOT NULL AUTO_INCREMENT,
    `magazine_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`magazine_bookmark_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `organization` (
    `organization_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `photo_url` VARCHAR(191) NULL,
    `homepage_url` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,
    `location_id` BIGINT NULL,

    PRIMARY KEY (`organization_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `log` (
    `log_id` INTEGER NOT NULL AUTO_INCREMENT,
    `activity_details` JSON NULL,
    `created_at` DATETIME(3) NULL,
    `user_activity_type_id` INTEGER NULL,
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_activity_type` (
    `user_activity_type_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`user_activity_type_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `location`(`location_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `location` ADD CONSTRAINT `location_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `location`(`location_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tip` ADD CONSTRAINT `tip_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tip_media` ADD CONSTRAINT `tip_media_tips_id_fkey` FOREIGN KEY (`tips_id`) REFERENCES `tip`(`tips_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tip_save` ADD CONSTRAINT `tip_save_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tip_save` ADD CONSTRAINT `tip_save_tips_id_fkey` FOREIGN KEY (`tips_id`) REFERENCES `tip`(`tips_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_account` ADD CONSTRAINT `social_account_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `comment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `comment_tips_id_fkey` FOREIGN KEY (`tips_id`) REFERENCES `tip`(`tips_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_trigger_user_id_fkey` FOREIGN KEY (`trigger_user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `Notification_Tip_fkey` FOREIGN KEY (`tips_id`) REFERENCES `tip`(`tips_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `Notification_Comment_fkey` FOREIGN KEY (`comment_id`) REFERENCES `comment`(`comment_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tip_like` ADD CONSTRAINT `tip_like_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tip_like` ADD CONSTRAINT `tip_like_tips_id_fkey` FOREIGN KEY (`tips_id`) REFERENCES `tip`(`tips_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_statistic` ADD CONSTRAINT `user_statistic_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_answer` ADD CONSTRAINT `quiz_answer_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_answer` ADD CONSTRAINT `quiz_answer_quiz_id_fkey` FOREIGN KEY (`quiz_id`) REFERENCES `quiz`(`quiz_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hashtag` ADD CONSTRAINT `hashtag_hashtag_type_id_fkey` FOREIGN KEY (`hashtag_type_id`) REFERENCES `hashtag_type`(`hashtag_type_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tip_hashtag` ADD CONSTRAINT `tip_hashtag_tips_id_fkey` FOREIGN KEY (`tips_id`) REFERENCES `tip`(`tips_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tip_hashtag` ADD CONSTRAINT `tip_hashtag_hashtag_id_fkey` FOREIGN KEY (`hashtag_id`) REFERENCES `hashtag`(`hashtag_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `magazine` ADD CONSTRAINT `magazine_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`organization_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `magazine` ADD CONSTRAINT `magazine_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `location`(`location_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `magazine_hashtag` ADD CONSTRAINT `magazine_hashtag_magazine_id_fkey` FOREIGN KEY (`magazine_id`) REFERENCES `magazine`(`magazine_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `magazine_hashtag` ADD CONSTRAINT `magazine_hashtag_hashtag_id_fkey` FOREIGN KEY (`hashtag_id`) REFERENCES `hashtag`(`hashtag_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `magazine_image` ADD CONSTRAINT `magazine_image_magazine_id_fkey` FOREIGN KEY (`magazine_id`) REFERENCES `magazine`(`magazine_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `magazine_like` ADD CONSTRAINT `magazine_like_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `magazine_like` ADD CONSTRAINT `magazine_like_magazine_id_fkey` FOREIGN KEY (`magazine_id`) REFERENCES `magazine`(`magazine_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `magazine_bookmark` ADD CONSTRAINT `magazine_bookmark_magazine_id_fkey` FOREIGN KEY (`magazine_id`) REFERENCES `magazine`(`magazine_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `magazine_bookmark` ADD CONSTRAINT `magazine_bookmark_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `organization` ADD CONSTRAINT `organization_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `location`(`location_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `log` ADD CONSTRAINT `log_user_activity_type_id_fkey` FOREIGN KEY (`user_activity_type_id`) REFERENCES `user_activity_type`(`user_activity_type_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `log` ADD CONSTRAINT `log_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `User_email_key` TO `user_email_key`;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `User_nickname_key` TO `user_nickname_key`;
