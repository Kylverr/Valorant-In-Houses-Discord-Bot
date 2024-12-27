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
});

client.on('messageCreate', (message) => {
    if (message.author.bot)
        return;
    if (message.content === '!queue') {
        addUserToQueue(message.author);
        message.reply(`${message.author} added to the queue.`);
    }
    else if(message.content === '!leave') {
        removeUserFromQueue(message.author);
        message.reply(`${message.author} removed from the queue.`)
    }
    else if(message.content === '!join') {
        createUser(message.author);
        message.reply(`${message.author} created. You may join the queue now.`)
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
}

function removeUserFromQueue(user) {
    console.log(`Removed ${user}`);
}