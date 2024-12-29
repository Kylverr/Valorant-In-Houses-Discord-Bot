import dotenv from 'dotenv'
import discord from 'discord.js'
import { addUser, checkUserExistence } from './database.js'
dotenv.config();
const { Client, IntentsBitField, GuildMember } = discord;

const client = new Client( {
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
});

client.on('ready', (c) => {
    console.log(`${c.user.tag} is online.`)
});

client.on('interactionCreate', async (interaction) => {
    if(!interaction.isChatInputCommand()) return;
    try { 
        await interaction.deferReply();

        if(interaction.commandName === 'addi')
            await interaction.followUp('BETA IS HERE');
        else if(interaction.commandName === 'register') {
            await createUser(interaction.user);
            await interaction.followUp(`${interaction.user} created. You may join the queue now.`);
        }
        else if(interaction.commandName === 'join') {
            await addUserToQueue(interaction.user);
            await interaction.followUp(`${interaction.user} has joined the queue.`);
        }
        else if(interaction.commandName === 'leave') {
            await removeUserFromQueue(interaction.user);
            await interaction.followUp(`${interaction.user} has left the queue.`);
        }
    }
    catch (err) {
        console.error(`Error handling interaction: ${err}`);
        if (!interaction.replied) {
            await interaction.followUp(`Error replying to interaction.`);
        }
    }
});

client.login(process.env.TOKEN);

async function createUser(user) {
    const res = await checkUserExistence(user.id);
    if (res.length === 0) {
        console.log("account added");
        await addUser(user.id, 500, 0);
    }
    else {
        console.log("account already added");
    }
}

