-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('ADMIN', 'USER', 'INFLUENCER') NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE `chat_history` (
    `chat_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `question` VARCHAR(191) NOT NULL,
    `answer` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `chat_history_user_id_fkey`(`user_id`),
    PRIMARY KEY (`chat_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `chat_history` ADD CONSTRAINT `chat_history_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
