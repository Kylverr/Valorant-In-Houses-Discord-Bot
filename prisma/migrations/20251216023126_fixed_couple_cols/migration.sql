/*
  Warnings:

  - You are about to drop the column `discord_id` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the column `rl_games_played` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the column `val_games_played` on the `Player` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[disc_tag]` on the table `Player` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `disc_tag` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Player_discord_id_key` ON `Player`;

-- AlterTable
ALTER TABLE `Player` DROP COLUMN `discord_id`,
    DROP COLUMN `rl_games_played`,
    DROP COLUMN `val_games_played`,
    ADD COLUMN `disc_tag` VARCHAR(191) NOT NULL,
    ADD COLUMN `total_rl_games` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `total_val_games` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX `Player_disc_tag_key` ON `Player`(`disc_tag`);
