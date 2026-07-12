-- Add verification request/decision timestamps
ALTER TABLE `challenge_verification`
  ADD COLUMN `requested_at` DATETIME(3) NULL,
  ADD COLUMN `approved_at` DATETIME(3) NULL,
  ADD COLUMN `rejected_at` DATETIME(3) NULL;

-- Backfill existing rows and make requested_at required
UPDATE `challenge_verification`
SET `requested_at` = NOW(3)
WHERE `requested_at` IS NULL;

ALTER TABLE `challenge_verification`
  MODIFY `requested_at` DATETIME(3) NOT NULL;
