-- CreateTable
CREATE TABLE `challenge_hashtag` (
    `challenge_hashtag_id` INTEGER NOT NULL AUTO_INCREMENT,
    `challenge_id` INTEGER NOT NULL,
    `hashtag_id` INTEGER NOT NULL,

    INDEX `challenge_hashtag_challenge_id_fkey`(`challenge_id`),
    INDEX `challenge_hashtag_hashtag_id_fkey`(`hashtag_id`),
    PRIMARY KEY (`challenge_hashtag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

