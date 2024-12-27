import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();


const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}).promise()
console.log(pool.connect)

export async function addUser(user, mmr, games) {
    console.log(`Added ${user}`);
    
}

export async function checkUserExistence(user) {
    const [rows] = await pool.query(`SELECT * FROM Players WHERE disc_tag = ? ;`, [user.id]);
    return rows;
}