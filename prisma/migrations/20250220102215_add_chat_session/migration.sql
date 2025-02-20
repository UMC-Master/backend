/*
  Warnings:

  - Added the required column `session_id` to the `chat_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `chat_history` ADD COLUMN `session_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `chat_session` (
    `session_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `title` VARCHAR(191) NULL,

    INDEX `chat_session_user_id_fkey`(`user_id`),
    PRIMARY KEY (`session_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `chat_history_session_id_fkey` ON `chat_history`(`session_id`);

-- AddForeignKey
ALTER TABLE `chat_session` ADD CONSTRAINT `chat_session_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_history` ADD CONSTRAINT `chat_history_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `chat_session`(`session_id`) ON DELETE CASCADE ON UPDATE CASCADE;
