import dotenv from 'dotenv';
import discord from 'discord.js';
dotenv.config();
const { REST, Routes } = discord;


const commands = [
    {
        name: 'addi',
        description: 'BETA'
    }
];

const rest = new REST({version: '10'}).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('starting command additions...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            {
                body: commands
            }
        )
        console.log('done adding commands');
    } catch (error) {
        console.log(`Error: ${error}`);
    }
})();