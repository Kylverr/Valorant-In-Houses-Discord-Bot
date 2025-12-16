-- CreateTable
CREATE TABLE `Player` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `discord_id` VARCHAR(191) NOT NULL,
    `val_mmr` INTEGER NOT NULL,
    `val_games_played` INTEGER NOT NULL DEFAULT 0,
    `rl_mmr` INTEGER NOT NULL,
    `rl_games_played` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Player_discord_id_key`(`discord_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
