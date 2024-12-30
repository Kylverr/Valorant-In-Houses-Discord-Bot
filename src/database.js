import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();


const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}).promise()

async function checkConnection() {
    try {
        const [rows] = await pool.query('DELETE FROM Players WHERE disc_tag = 412309566735384577;');
        console.log(`Connection succeeded`);
    }
    catch (err) {
        console.log(`Connection failed`);
    }

}

checkConnection();

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
    const m = new Map();
    players.forEach(async (player) => {
        const playerMMR = await getPlayerMMR(player);
        m.put(player, playerMMR);
    });
    console.log(`Retrieving MMR of players`);
    return m;
}

async function getPlayerMMR(player) {
    const [playerInfo] = await getPlayer(player);
    return playerInfo.mmr;
}
