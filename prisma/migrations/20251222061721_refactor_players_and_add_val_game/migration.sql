-- CreateTable
CREATE TABLE `ValGame` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `winner` ENUM('A', 'D', 'U') NOT NULL DEFAULT 'U',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ValGamePlayer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gameId` INTEGER NOT NULL,
    `playerId` INTEGER NOT NULL,
    `team` ENUM('A', 'D', 'U') NOT NULL,

    INDEX `ValGamePlayer_playerId_idx`(`playerId`),
    INDEX `ValGamePlayer_gameId_idx`(`gameId`),
    UNIQUE INDEX `ValGamePlayer_gameId_playerId_key`(`gameId`, `playerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ValGamePlayer` ADD CONSTRAINT `ValGamePlayer_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `ValGame`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ValGamePlayer` ADD CONSTRAINT `ValGamePlayer_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `Player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
