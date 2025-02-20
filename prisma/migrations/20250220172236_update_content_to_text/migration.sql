-- AlterTable
ALTER TABLE `tip` MODIFY `content` TEXT NOT NULL;
ALTER TABLE `tip` ADD FULLTEXT INDEX `idx_content` (`content`);
