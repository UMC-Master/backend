-- CreateTable
CREATE TABLE `user_hashtag` (
    `user_hashtag_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `hashtag_id` INTEGER NOT NULL,

    INDEX `user_hashtag_hashtag_id_fkey`(`hashtag_id`),
    INDEX `user_hashtag_user_id_fkey`(`user_id`),
    PRIMARY KEY (`user_hashtag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_hashtag` ADD CONSTRAINT `user_hashtag_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_hashtag` ADD CONSTRAINT `user_hashtag_hashtag_id_fkey` FOREIGN KEY (`hashtag_id`) REFERENCES `hashtag`(`hashtag_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
