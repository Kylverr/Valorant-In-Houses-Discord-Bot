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

client.on('interactionCreate', (interaction) => {
    if(!interaction.isChatInputCommand()) return;

    if(interaction.commandName === 'addi')
        interaction.reply('BETA IS HERE');
    else if(interaction.commandName === 'register') {
	createUser(interaction.user);
        interaction.reply(`${interaction.user} created. You may join the queue now.`);
    }
    else if(interaction.commandName === 'join') {
        addUserToQueue(interaction.user);
        interaction.reply(`${interaction.user} has joined the queue.`);
    }
    else if(interaction.commandName === 'leave') {
        removeUserFromQueue(interaction.user);
        interaction.reply(`${interaction.user} has left the queue.`);
    }
});

client.login(process.env.TOKEN);

function createUser(user) {
    const res = checkUserExistence(user);
    if (res) {
        console.log("account added");
        addUser(user, 500, 0);
    }
    else {
        console.log("account already added");
    }
}

function addUserToQueue(user) {
    console.log(`Added ${user}`);
}

function removeUserFromQueue(user) {
    console.log(`Removed ${user}`);
}
