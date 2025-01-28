import dotenv from 'dotenv'
import discord from 'discord.js'
import { addPlayer, getPlayer, getPlayersMMR, getPlayersTotalGames, updatePlayerMMRSAndTotalGames } from './database.js'
import Queue from './queue.js'
import ValMatch from './val-match.js'
dotenv.config();
const { Client, IntentsBitField, GuildMember } = discord;

const q = new Queue();
const tempUsers = [process.env.KY_DISC_ID, process.env.MIKKA_DISC_ID, process.env.WARP_DISC_ID, process.env.GREGGO_DISC_ID];
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
            const res = await createUser(interaction.user.id);
            await interaction.followUp(determineResponse(`${interaction.user} created. You may join the queue now.`,
            `${interaction.user} has already been registered.`,
            res));
        }
        else if(interaction.commandName === 'join') {
            const res = 0; 
            try {
                res = await addUserToQueue(interaction.user.id);
                let retStr = (determineResponse(`${interaction.user} has joined the queue.`,
                `${interaction.user} has not been registered before.`,
                res));

                for(const id of res) {
                    const user = await users.fetch(id);
                    retStr += (`${user.toString()}\n`);
                }

                await interaction.followUp(retStr);

           }
            catch (e) {
                await interaction.followUp(`${interaction.user} has already joined the queue.\nError: ${e}`);
            }
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
            await interaction.followUp(`Reported result: ${result}\nUpdate MMRS:\n${await playersToString(newPlayersMMR, interaction.client.users)}`);
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

/**
 * Creates a user within the database with the specified user id.
 * @param user The user id to be registered within the database
 * @return -1 if the user was already created, 0 if the operation was successful
 */
async function createUser(user) {
    const res = await getPlayer(user);
    if (res.length === 0) {
        await addPlayer(user, 500, 0);
        return 0;
    }
    else {
        return -1;
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
        return q.add(user);
    }
}

async function reportResult(result, reportingUser) {
    const queueArr = q.getQueue();
    const playersWithMMR = await getPlayersMMR(queueArr);
    const playersWithTotalGames = await getPlayersTotalGames(queueArr);
    const newPlayersWithMMR = match.reportResult(result, playersWithMMR, playersWithTotalGames, reportingUser);
    console.log(newPlayersWithMMR);
    await updatePlayerMMRSAndTotalGames(newPlayersWithMMR);
    q.clearQueue();
    return newPlayersWithMMR;
}

async function playersToString(playersWithMMR, users) {
    let s = ``;
    for(const [id, mmr] of playersWithMMR) {
        const user = await users.fetch(id);
        s += (`${user.toString()}: ${mmr}\n`);
    }
    return s;
}

/**
 * Determines whether the successful message or failure message should be returned given the provided result.
 * The provided result is assumed to be -1 if a failure, a success otherwise.
 * @successfulResponse The successful message
 * @failureResponse The failure message
 * @res Result to determine which message is returned. It is assumed -1 is a failure, a success otherwise.
 * @return The correct response according to the given result
 */
function determineResponse(successfulResponse, failureResponse, res) {
    return res === -1 ? failureResponse : successfulResponse;
}
