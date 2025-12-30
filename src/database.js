import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}).promise();

/**
 * Game-specific column mappings
 * This is the ONLY place where VAL / RL differ at the DB level
 */
const GAME_COLUMNS = {
    VAL: {
        mmr: 'val_mmr',
        totalGames: 'total_val_games'
    },
    RL: {
        mmr: 'rl_mmr',
        totalGames: 'total_rl_games'
    }
};

const TEAM_DEFS = {
    VAL: ['A', 'D'],
    RL: ['BLUE', 'ORANGE']
};


/* ------------------------------------------------------------------ */
/* Connection check                                                     */
/* ------------------------------------------------------------------ */

export async function checkConnection() {
    const [rows] = await pool.query(`SELECT disc_tag FROM Player;`);
    console.log(`Connected. Players: ${rows.length}`);
}

/* ------------------------------------------------------------------ */
/* Player helpers                                                       */
/* ------------------------------------------------------------------ */

export async function addPlayer(user, val_mmr, val_games, rl_mmr, rl_games) {
    await pool.query(
        `INSERT INTO Player(disc_tag, val_mmr, total_val_games, rl_mmr, total_rl_games)
         VALUES (?, ?, ?, ?, ?);`,
        [user, val_mmr, val_games, rl_mmr, rl_games]
    );
}

export async function getPlayer(discTag) {
    const [rows] = await pool.query(
        `SELECT * FROM Player WHERE disc_tag = ?;`,
        [discTag]
    );
    return rows[0] ?? null;
}

/* ------------------------------------------------------------------ */
/* MMR queries (generic)                                                */
/* ------------------------------------------------------------------ */

export async function getPlayersMMR(game, players) {
    const { mmr } = GAME_COLUMNS[game];
    const result = new Map();

    const queries = players.map(async (playerId) => {
        const [rows] = await pool.query(
            `SELECT ${mmr} FROM Player WHERE disc_tag = ?;`,
            [playerId]
        );
        if (rows.length === 0) return;
        result.set(playerId, rows[0][mmr]);
    });

    await Promise.all(queries);
    return result;
}

export async function getPlayersTotalGames(game, players) {
    const { totalGames } = GAME_COLUMNS[game];
    const result = new Map();

    const queries = players.map(async (playerId) => {
        const [rows] = await pool.query(
            `SELECT ${totalGames} FROM Player WHERE disc_tag = ?;`,
            [playerId]
        );
        if (rows.length === 0) return;
        result.set(playerId, rows[0][totalGames]);
    });

    await Promise.all(queries);
    return result;
}

/* ------------------------------------------------------------------ */
/* MMR updates                                                          */
/* ------------------------------------------------------------------ */

export async function updatePlayersMMR(game, playersWithMMR) {
    const { mmr, totalGames } = GAME_COLUMNS[game];

    const updates = Array.from(playersWithMMR.entries()).map(
        async ([playerId, newMMR]) => {
            await pool.query(
                `UPDATE Player
                 SET ${mmr} = ?, ${totalGames} = ${totalGames} + 1
                 WHERE disc_tag = ?;`,
                [newMMR, playerId]
            );
        }
    );

    await Promise.all(updates);
}

/* ------------------------------------------------------------------ */
/* Game + GamePlayer persistence                                        */
/* ------------------------------------------------------------------ */

export async function createGame(gameType, winner, playersByTeam) {
    const [result] = await pool.query(
        `INSERT INTO Game(type, winner) VALUES (?, ?);`,
        [gameType, winner]
    );
    // add game players separately
    await addGamePlayers(result.insertId, playersByTeam);
    return result.insertId;
}

export async function addGamePlayers(gameId, playersByTeam) {
    const inserts = [];

    for (const [team, players] of Object.entries(playersByTeam)) {
        for (const playerId of players) {
            inserts.push(
                pool.query(
                    `INSERT INTO GamePlayer(gameId, playerId, team)
                     SELECT ?, id, ?
                     FROM Player
                     WHERE disc_tag = ?;`,
                    [gameId, team, playerId]
                )
            );
        }
    }

    await Promise.all(inserts);
}

export async function setGameWinner(gameId, winningTeam) {
    await pool.query(
        `UPDATE Game SET winner = ? WHERE id = ?;`,
        [winningTeam, gameId]
    );
}
