-- CreateTable
CREATE TABLE `User` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `nickname` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NULL,
    `district` VARCHAR(191) NULL,
    `profile_image_url` VARCHAR(191) NULL,
    `login_type` ENUM('EMAIL', 'KAKAO') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `location_id` BIGINT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_nickname_key`(`nickname`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Location` (
    `location_id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `parent_id` BIGINT NULL,
    `created_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`location_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tip` (
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
CREATE TABLE `TipMedia` (
    `media_id` INTEGER NOT NULL AUTO_INCREMENT,
    `tips_id` INTEGER NOT NULL,
    `media_url` VARCHAR(191) NOT NULL,
    `media_type` ENUM('image', 'video') NOT NULL,
    `uploaded_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`media_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TipSave` (
    `save_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `tips_id` INTEGER NOT NULL,
    `scraped_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`save_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SocialAccount` (
    `social_id` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `provider` ENUM('KAKAO') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`social_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comment` (
    `comment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `tips_id` INTEGER NOT NULL,
    `comment` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`comment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
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
CREATE TABLE `TipLike` (
    `like_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `tips_id` INTEGER NOT NULL,
    `liked_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`like_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserStatistic` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `quiz_score` INTEGER NOT NULL DEFAULT 0,
    `tips_shared_count` INTEGER NOT NULL DEFAULT 0,
    `likes_received` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `UserStatistic_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Quiz` (
    `quiz_id` INTEGER NOT NULL AUTO_INCREMENT,
    `question` VARCHAR(191) NOT NULL,
    `correct_answer` VARCHAR(191) NOT NULL,
    `quiz_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`quiz_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuizAnswer` (
    `answer_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `quiz_id` INTEGER NOT NULL,
    `submitted_answer` ENUM('O', 'X') NOT NULL,
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`answer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Hashtag` (
    `hashtag_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`hashtag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TipHashtag` (
    `tips_hashtag_id` INTEGER NOT NULL AUTO_INCREMENT,
    `tips_id` INTEGER NOT NULL,
    `hashtag_id` INTEGER NOT NULL,

    PRIMARY KEY (`tips_hashtag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Magazine` (
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
CREATE TABLE `MagazineHashtag` (
    `magazine_hashtag_id` BIGINT NOT NULL AUTO_INCREMENT,
    `hashtag_id` INTEGER NULL,
    `magazine_id` INTEGER NULL,

    PRIMARY KEY (`magazine_hashtag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MagazineImage` (
    `magazine_photo_id` INTEGER NOT NULL AUTO_INCREMENT,
    `image_url` VARCHAR(191) NOT NULL,
    `magazine_id` INTEGER NOT NULL,

    PRIMARY KEY (`magazine_photo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MagazineLike` (
    `magazine_like_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `magazine_id` INTEGER NOT NULL,

    PRIMARY KEY (`magazine_like_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MagazineBookmark` (
    `magazine_bookmark_id` INTEGER NOT NULL AUTO_INCREMENT,
    `magazine_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`magazine_bookmark_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Organization` (
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
CREATE TABLE `Log` (
    `log_id` INTEGER NOT NULL AUTO_INCREMENT,
    `activity_details` JSON NULL,
    `created_at` DATETIME(3) NULL,
    `user_activity_type_id` INTEGER NULL,
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserActivityType` (
    `user_activity_type_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`user_activity_type_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `Location`(`location_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Location` ADD CONSTRAINT `Location_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `Location`(`location_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tip` ADD CONSTRAINT `Tip_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TipMedia` ADD CONSTRAINT `TipMedia_tips_id_fkey` FOREIGN KEY (`tips_id`) REFERENCES `Tip`(`tips_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TipSave` ADD CONSTRAINT `TipSave_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TipSave` ADD CONSTRAINT `TipSave_tips_id_fkey` FOREIGN KEY (`tips_id`) REFERENCES `Tip`(`tips_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SocialAccount` ADD CONSTRAINT `SocialAccount_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_tips_id_fkey` FOREIGN KEY (`tips_id`) REFERENCES `Tip`(`tips_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_trigger_user_id_fkey` FOREIGN KEY (`trigger_user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_Tip_fkey` FOREIGN KEY (`tips_id`) REFERENCES `Tip`(`tips_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_Comment_fkey` FOREIGN KEY (`comment_id`) REFERENCES `Comment`(`comment_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TipLike` ADD CONSTRAINT `TipLike_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TipLike` ADD CONSTRAINT `TipLike_tips_id_fkey` FOREIGN KEY (`tips_id`) REFERENCES `Tip`(`tips_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserStatistic` ADD CONSTRAINT `UserStatistic_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuizAnswer` ADD CONSTRAINT `QuizAnswer_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuizAnswer` ADD CONSTRAINT `QuizAnswer_quiz_id_fkey` FOREIGN KEY (`quiz_id`) REFERENCES `Quiz`(`quiz_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TipHashtag` ADD CONSTRAINT `TipHashtag_tips_id_fkey` FOREIGN KEY (`tips_id`) REFERENCES `Tip`(`tips_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TipHashtag` ADD CONSTRAINT `TipHashtag_hashtag_id_fkey` FOREIGN KEY (`hashtag_id`) REFERENCES `Hashtag`(`hashtag_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Magazine` ADD CONSTRAINT `Magazine_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `Organization`(`organization_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Magazine` ADD CONSTRAINT `Magazine_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `Location`(`location_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MagazineHashtag` ADD CONSTRAINT `MagazineHashtag_magazine_id_fkey` FOREIGN KEY (`magazine_id`) REFERENCES `Magazine`(`magazine_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MagazineHashtag` ADD CONSTRAINT `MagazineHashtag_hashtag_id_fkey` FOREIGN KEY (`hashtag_id`) REFERENCES `Hashtag`(`hashtag_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MagazineImage` ADD CONSTRAINT `MagazineImage_magazine_id_fkey` FOREIGN KEY (`magazine_id`) REFERENCES `Magazine`(`magazine_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MagazineLike` ADD CONSTRAINT `MagazineLike_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MagazineLike` ADD CONSTRAINT `MagazineLike_magazine_id_fkey` FOREIGN KEY (`magazine_id`) REFERENCES `Magazine`(`magazine_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MagazineBookmark` ADD CONSTRAINT `MagazineBookmark_magazine_id_fkey` FOREIGN KEY (`magazine_id`) REFERENCES `Magazine`(`magazine_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MagazineBookmark` ADD CONSTRAINT `MagazineBookmark_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Organization` ADD CONSTRAINT `Organization_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `Location`(`location_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Log` ADD CONSTRAINT `Log_user_activity_type_id_fkey` FOREIGN KEY (`user_activity_type_id`) REFERENCES `UserActivityType`(`user_activity_type_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Log` ADD CONSTRAINT `Log_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
