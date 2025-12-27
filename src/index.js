import dotenv from 'dotenv'
import discord from 'discord.js'
import { addPlayer, getPlayer, getPlayersMMR, getPlayersTotalGames } from './database.js'
import Queue from './models/queue.js'
import ValMatch from './models/val-match.js'
dotenv.config();
const { Client, IntentsBitField, GuildMember } = discord;

const queues = {
    VAL: new Queue({ game: 'VAL', maxSize: 10 }),
    RL: new Queue({ game: 'RL', maxSize: 8 })
};

const tempUsers = [process.env.KY_DISC_ID, process.env.MIKKA_DISC_ID, process.env.WARP_DISC_ID, process.env.GREGGO_DISC_ID];

let nextMatchID = 1;
const matchesByOwner = new Map(); // ownerId -> Match


const client = new Client({ intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMembers, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent] });


client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    try {
        await interaction.deferReply();
        console.log(`interaction deferred`);
        if (interaction.commandName === 'addi') {
            await interaction.followUp(`BETA IS HERE`);
        }
        else if (interaction.commandName === 'generate') {
            const game = interaction.options.get('game').value;
            const match = await generateMatch(game, interaction.user.id);

            if (!match) {
                await interaction.followUp("Not enough players");
                return;
            }

            if (game === 'VAL') {
                const attackingUsers = await Promise.all(match.getTeam('attacking').map((id) => interaction.client.users.fetch(id.toString()).then((user) => user.toString())));
                const defendingUsers = await Promise.all(match.getTeam('defending').map((id) => interaction.client.users.fetch(id.toString()).then((user) => user.toString())));

                await interaction.followUp(`Attackers: ${attackingUsers.join(", ")}\nDefenders: ${defendingUsers.join(", ")}`);
            }
            else if (game === 'RL') {
                const blueUsers = await Promise.all(match.getTeam('blue').map((id) => interaction.client.users.fetch(id.toString()).then((user) => user.toString())));
                const orangeUsers = await Promise.all(match.getTeam('orange').map((id) => interaction.client.users.fetch(id.toString()).then((user) => user.toString())));

                await interaction.followUp(`Blue Team: ${blueUsers.join(", ")}\nOrange Team: ${orangeUsers.join(", ")}`);
            }

        }
        else if (interaction.commandName === 'join') {
            const game = interaction.options.get('game').value;
            const queue = queues[game];

            await addUserToQueue(queue, interaction.user.id);
            await interaction.followUp(
                `${interaction.user} joined the ${game} queue\n` +
                await printQueue(queue, interaction.client.users)
            );

        }
        else if (interaction.commandName === 'leave') {
            const game = interaction.options.get('game').value;
            const queue = queues[game];
            queue.remove(interaction.user.id);

            await interaction.followUp(
                `${interaction.user} left the ${game} queue\n` +
                await printQueue(queue, interaction.client.users)
            );
        }
        else if (interaction.commandName === 'mmr') {
            const userID = await interaction.user.id;
            const player = await getPlayer(userID);
            const game = interaction.options.get('game').value;
            const userString = await interaction.client.users.fetch(userID).then((user) => user.toString());
            if(player.length === 0) {
                await interaction.followUp(`${userString} has not been registered before.`);
                return;
            }
            await interaction.followUp(game === 'VAL' ? `Valorant MMR for ${userString}: ${player[0].val_mmr}` : `Rocket League MMR for ${userString}: ${player[0].rl_mmr}`);
        }
        else if (interaction.commandName === 'queues'){
            let retStr = `Queues:\n\n`;
            for (const [game, queue] of Object.entries(queues)) {
                retStr += await printQueue(queue, interaction.client.users);
            }

            await interaction.followUp(retStr);
        }
        else if (interaction.commandName === 'register') {
            const created = await createUser(interaction.user.id);
            await interaction.followUp(created ? `${interaction.user} created. You may join the queue now.` :
                `${interaction.user} has already been registered.`);
        }
        else if (interaction.commandName === 'report') {
            const match = matchesByOwner.get(interaction.user.id);
            if(!match) {
                const user = await interaction.client.users.fetch(interaction.user.id).then((user) => user.toString());
                await interaction.followUp(`${user} does not have an active match to report results for.`);
                return;
            }

            const result = interaction.options.get('result').value;
            const newPlayersMMR = await reportMatchResult(interaction.user.id, result);
            await interaction.followUp(`Reported result: ${result}\nUpdate MMRS:\n${await playersToString(newPlayersMMR, interaction.client.users)}`);
        }
        else if (interaction.commandName === 'start') {
            if(queuesByOwner.has(interaction.user.id)) {
                const user = await interaction.client.users.fetch(interaction.user.id).then((user) => user.toString());
                await interaction.followUp(`${user} has already started a queue.`); 
                return;
            }
            const game = interaction.options.get('game').value;
            await interaction.followUp(`Created a queue for a ${game} game.`);
        }
        else if (interaction.commandName === 'steal') {
            const mikkaUser = await interaction.client.users.fetch(process.env.MIKKA_DISC_ID).then((user) => user.toString());
            await interaction.followUp(`Hacking...\nComplete!\nSucessfully stole 1 million robux(s) from ${mikkaUser}`);
        }
    }
    catch (err) {
        console.error(`Error handling interaction: ${err}`);
        if (!interaction.replied) {
            try {
                await interaction.followUp(`Error replying to interaction: ${err.stack}`);
            }
            catch (e) {
                await interaction.followUp(`Stupid dumb error replying to interaction: ${e}`);
            }
        }
    }
});

client.login(process.env.TOKEN);

/**
 * Creates a user within the database with the specified user id.
 * @param user The user id to be registered within the database
 * @return false if the user was already created, true if the operation was successful
 */
async function createUser(user) {
    const res = await getPlayer(user);

    if (res.length > 0) {
        return false;
    }

    await addPlayer(user, 500, 0);
    return true;
}


async function generateMatch(game, ownerId) {
    if (matchesByOwner.has(ownerId)) {
        throw new Error('You already have an active match');
    }

    const queue = queues[game];
    if (queue.getSize() < 2) {
        return null;
    }

    const match =
        game === 'VAL'
            ? new ValMatch(nextMatchID++, ownerId)
            : new RocketLeagueMatch(nextMatchID++, ownerId);

    const players = await getPlayersMMR(game, queue.getPlayers());
    const sortedPlayers = new Map(
        [...players.entries()].sort((a, b) => a[1] - b[1])
    );

    match.generateTeams(sortedPlayers);
    queue.clear();

    matchesByOwner.set(ownerId, match);
    return match;
}



async function addUserToQueue(queue, user) {
    const res = await getPlayer(user);
    if (res.length === 0) {
        return -1;
    }
    else {
        return queue.add(user);
    }
}

async function reportMatchResult(ownerId, result) {
    const match = matchesByOwner.get(ownerId);
    if (!match) {
        throw new Error('You do not own an active match');
    }

    const playerIDs = match.getAllPlayers();
    const playersWithMMR = await getPlayersMMR(match.game, playerIDs);
    const playersWithTotalGames = await getPlayersTotalGames(match.game, playerIDs);

    const newMMRs = match.reportResult(
        result,
        playersWithMMR,
        playersWithTotalGames,
        ownerId
    );

    await updatePlayersMMR(match.game, newMMRs);

    matchesByOwner.delete(ownerId); // match complete
    return newMMRs;
}


/**
 * Converts a map of key user id in String form and value int MMR to a String.
 * @param {Map} playersWithMMR - map with key String and value number
 * @param {number} users list of discord users
 * @returns String representation of players
 */
async function playersToString(playersWithMMR, users) {
    let s = ``;
    for (const [id, mmr] of playersWithMMR) {
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

async function printQueue(queue, users) {
    let retStr = `Queue ${queue.game}:\n`;
    const players = queue.players;
    for (const userID of players) {
        const user = await users.fetch(userID);
        retStr += (`${user.toString()}\n`);
    }
    return retStr;
}
