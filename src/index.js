import dotenv from 'dotenv'
import discord from 'discord.js'
import { addPlayer, getPlayer, getPlayersMMR } from './database.js'
import Queue from './queue.js'
import ValMatch from './val-match.js'
dotenv.config();
const { Client, IntentsBitField, GuildMember } = discord;

const q = new Queue();
const match = new ValMatch();

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
            const res = await addUserToQueue(interaction.user);
            if (res === 0)
                await interaction.followUp(`${interaction.user} has joined the queue.`);
            else
                await interaction.followUp(`${interaction.user} has not been registered before.`);
        }
        else if(interaction.commandName === 'leave') {
            q.remove(interaction.user);
            await interaction.followUp(`${interaction.user} has left the queue.`);
        }
        else if(interaction.commandName === 'generate') {
            const res = await generateTeams();
            if (res.length === 0)
                await interaction.followUp(`Not enough players for a match.`);
            else {
                await interaction.followUp(`Enough players for a match.`);
            }
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
    const res = await getPlayer(user.id);
    if (res.length === 0) {
        console.log("account added");
        await addPlayer(user.id, 500, 0);
    }
    else {
        console.log("account already added");
    }
}

async function generateTeams() {
    if (q.getSize() < 2)
        return [];
    const players = await getPlayersMMR(q.getQueue()); 
    console.log(players);
    match.generateTeams();
}

async function addUserToQueue(user) {
    const res = await getPlayer(user.id);
    if (res.length === 0) {
        return -1;
    }
    else {
        q.add(user);
        return 0;
    }
}


