import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();


const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}).promise()

/**
 * Helper function that runs a sample query using the given connection. If the query runs, the connection 
 * to the database was successful.
 */
async function checkConnection() {
    try {
        const [rows] = await pool.query(`SELECT disc_tag FROM Players;`);
        console.log(`Connection succeeded. Number of current players: ${rows.length}\nPlayers: ${rows}`);
    }
    catch (err) {
        console.log(`Connection failed`);
    }

}

async function registerUsers(users, mmrs) {
    for(let i = 0; i < users.length; i++) {
        const [rows] = await pool.query(`INSERT INTO Players(disc_tag, mmr, total_games) VALUES(?, ?, ?);`, [users[i], mmrs[i], 0]);
        console.log(`registered: ${users[i]}, ${mmrs[i]}`);
    }
}

async function removeAllRegistrations() {
    const [rows] = await pool.query(`DELETE FROM Players;`);
}


await checkConnection();


await removeAllRegistrations();


await registerUsers(
        ["412309566735384577", "877323881076101141", "505514753112670219", "670680767894126633"],
        [950, 500, 500, 1]
);



export async function addPlayer(user, mmr, games) {
    const [rows] = await pool.query(`INSERT INTO Players(disc_tag, mmr, total_games) VALUES(?, ?, ?);`, [user, mmr, games]);
    console.log(`Added ${user}`);
    return rows;
}

export async function getPlayer(player) {
    const [rows] = await pool.query(`SELECT * FROM Players WHERE disc_tag = ? ;`, [player]);
    return rows;
}

export async function getPlayersMMR(players) {
    let m = new Map();
    const mmrPromises = players.map( async (player) => {
        const playerMMR = await getPlayerMMR(player);
        m.set(player, playerMMR);
        console.log(player)
    });
    await Promise.all(mmrPromises);
    console.log(`Retrieving MMR of players`);
    return m;
}

async function getPlayerMMR(player) {
    const playerInfo = await getPlayer(player);

    if (!playerInfo || playerInfo.length === 0) {
        console.error(`No player found for ID: ${player}`);
        return null;
    }

    return playerInfo[0].mmr;
}
export async function getPlayersTotalGames(players) {
    let m = new Map();
    const totalGamePromises = players.map( async (player) => {
        const playerTotalGames = await getPlayerTotalGames(player);
        m.set(player, playerTotalGames);
        console.log(player)
    });
    await Promise.all(totalGamePromises);
    console.log(`Retrieving Total Games of players`);
    return m;
}

async function getPlayerTotalGames(player) {
    const playerInfo = await getPlayer(player);

    if (!playerInfo || playerInfo.length === 0) {
        console.error(`No player found for ID: ${player}`);
        return null;
    }

    return playerInfo[0].total_games;
}

export async function updatePlayerMMRSAndTotalGames(playersWithMMR) {
    console.log(`Updating players`);
    const mmrPromises = Array.from(playersWithMMR).map( async ([id, mmr]) => {
        await updatePlayerMMR(id, mmr);
    });
    await Promise.all(mmrPromises);
}

async function updatePlayerMMR(id, mmr) {
    const [rows] = await pool.query(`UPDATE Players SET mmr = ?, total_games = total_games + 1 WHERE disc_tag = ?;`, [mmr, id]);
    console.log(rows[0]);
    return rows[0];
}
