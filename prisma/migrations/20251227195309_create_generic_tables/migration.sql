/*
  Warnings:

  - You are about to drop the `ValGame` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ValGamePlayer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ValGamePlayer` DROP FOREIGN KEY `ValGamePlayer_gameId_fkey`;

-- DropForeignKey
ALTER TABLE `ValGamePlayer` DROP FOREIGN KEY `ValGamePlayer_playerId_fkey`;

-- DropTable
DROP TABLE `ValGame`;

-- DropTable
DROP TABLE `ValGamePlayer`;

-- CreateTable
CREATE TABLE `Game` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('VAL', 'RL') NOT NULL,
    `winner` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GamePlayer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gameId` INTEGER NOT NULL,
    `playerId` INTEGER NOT NULL,
    `team` VARCHAR(191) NOT NULL,

    INDEX `GamePlayer_playerId_idx`(`playerId`),
    INDEX `GamePlayer_gameId_idx`(`gameId`),
    UNIQUE INDEX `GamePlayer_gameId_playerId_key`(`gameId`, `playerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GamePlayer` ADD CONSTRAINT `GamePlayer_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GamePlayer` ADD CONSTRAINT `GamePlayer_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `Player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
