import dotenv from 'dotenv'
import discord from 'discord.js'
import { addPlayer, getPlayer, getPlayersMMR, getPlayersTotalGames, updatePlayerMMRSAndTotalGames } from './database.js'
import Queue from './queue.js'
import ValMatch from './val-match.js'
dotenv.config();
const { Client, IntentsBitField, GuildMember } = discord;

const q = new Queue();
const tempUsers = ["412309566735384577", "877323881076101141", "505514753112670219", "670680767894126633"];
const match = new ValMatch(); 
const client = new Client( { intents: [ IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMembers, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent ] }); 
client.on('ready', (c) => { 
    console.log(`${c.user.tag} is online.`); 
    for(const user of tempUsers) 
    { 
        q.add(user); 
    } 
}); 
client.on('interactionCreate', async (interaction) => { 
    if(!interaction.isChatInputCommand()) return; 
    try { 
        await interaction.deferReply(); 
        console.log(`interaction deferred`); 
        if(interaction.commandName === 'addi') { 
            await interaction.followUp(`BETA IS HERE`); 
        } 
        else if(interaction.commandName === 'register') {
            await createUser(interaction.user.id);
            await interaction.followUp(`${interaction.user} created. You may join the queue now.`);
        }
        else if(interaction.commandName === 'join') {
            const res = await addUserToQueue(interaction.user.id);
            if (res === 0)
                await interaction.followUp(`${interaction.user} has joined the queue.`);
            else
                await interaction.followUp(`${interaction.user} has not been registered before.`);
        }
        else if(interaction.commandName === 'leave') {
            q.remove(interaction.user.id);
            await interaction.followUp(`${interaction.user} has left the queue.`);
        }
        else if (interaction.commandName === 'generate') {
            const { attacking, defending } = await generateTeams();  // Get the result from generateTeams
            if (attacking.length === 0)
                await interaction.followUp(`Not enough players`);
            else {
                const attackingUsers = await Promise.all(attacking.map( (id) => interaction.client.users.fetch(id.toString()).then( (user) => user.toString())));
                const defendingUsers = await Promise.all(defending.map( (id) => interaction.client.users.fetch(id.toString()).then( (user) => user.toString())));
                
                await interaction.followUp(`Attackers: ${attackingUsers.join(", ")}\nDefenders: ${defendingUsers.join(", ")}`);
            }
                
        }
        else if (interaction.commandName === 'steal') {
            const mikkaUser = await interaction.client.users.fetch('877323881076101141').then( (user) => user.toString());
            await interaction.followUp(`Hacking...\nComplete!\nSucessfully stole 1 million robux(s) from ${mikkaUser}`);
        }
        else if (interaction.commandName === 'report') {
            const result = await interaction.options.get('result').value;
            const newPlayersMMR = await reportResult(result, interaction.user.id);
            await interaction.followUp(`Reported result: ${result}\nUpdate MMRS: ${JSON.stringify([...newPlayersMMR])}`);
        }
    }
    catch (err) {
        console.error(`Error handling interaction: ${err}`);
        if (!interaction.replied) {
            try {
                await interaction.followUp(`Error replying to interaction: ${err.stack}`);
            }
            catch (e) {
                await interaction.followUp(`Supid dumb error replying to interaction: ${e}`);
            }
        }
    }
});

client.login(process.env.TOKEN);

async function createUser(user) {
    const res = await getPlayer(user);
    if (res.length === 0) {
        console.log("account added");
        await addPlayer(user, 500, 0);
    }
    else {
        console.log("account already added");
    }
}

async function generateTeams() {
    if (q.getSize() < 2) {
        return { attacking: [], defending: [] }
    }
    const queueArr = q.getQueue();
    const players = await getPlayersMMR(queueArr);
    // sort players according to mmr
    const sortedPlayers = new Map([... players.entries()].sort( (a, b) => a[1] - b[1]));
    const { attacking, defending } = match.generateTeams(sortedPlayers);
    return { attacking, defending };
}


async function addUserToQueue(user) {
    const res = await getPlayer(user);
    if (res.length === 0) {
        return -1;
    }
    else {
        q.add(user);
        return 0;
    }
}

async function reportResult(result, reportingUser) {
    const queueArr = q.getQueue();
    const playersWithMMR = await getPlayersMMR(queueArr);
    const playersWithTotalGames = await getPlayersTotalGames(queueArr);
    const newPlayersWithMMR = match.reportResult(result, playersWithMMR, playersWithTotalGames, reportingUser);
    console.log(newPlayersWithMMR);
    await updatePlayerMMRSAndTotalGames(newPlayersWithMMR);
    return newPlayersWithMMR;
}
