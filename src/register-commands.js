import dotenv from 'dotenv';
import discord from 'discord.js';
dotenv.config();
const { REST, Routes, ApplicationCommandOptionType } = discord;


const commands = [
    {
        name: 'addi',
        description: 'BETA',
    },
    {
        name: 'register',
        description: 'Register your Discord account with our database.',
    },
    {
        name: 'join',
        description: 'Join the current queue.',
        options:
            [
                {
                    name: 'queueid',
                    description: 'The ID of the queue you are looking to join.',
                    type: ApplicationCommandOptionType.Integer,
                    required: true
                }
            ]
    },
    {
        name: 'leave',
        description: 'Leave the current queue.',
    },
    {
        name: 'generate',
        description: 'Generate teams for a match.',
    },
    {
        name: 'report',
        description: 'Report the result of your game.',
        options:
            [
                {
                    name: 'result',
                    description: 'The result of your game. Report \"W\" if you won, or report \"L\" if you lost.',
                    type: ApplicationCommandOptionType.String,
                    choices:
                        [
                            {
                                name: 'W',
                                value: 'W',
                            },
                            {
                                name: 'L',
                                value: 'L',
                            }
                        ],
                    required: true,
                }
            ]
    },
    {
        name: 'start',
        description: 'Start a queue for a specified game.',
        options:
            [
                {
                    name: 'game',
                    description: 'The game you want to start a queue for. Choose \"RL\" for \"Rocket League\", or \"VAL\" for \"Valorant\".',
                    type: ApplicationCommandOptionType.String,
                    choices:
                        [
                            {
                                name: 'RL',
                                value: 'RL',
                            },
                            {
                                name: 'VAL',
                                value: 'VAL',
                            }
                        ],
                    required: true,
                }
            ]
    },
    {
        name: 'steal',
        description: 'Steal Mikka\'s money.',
    }


];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

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
