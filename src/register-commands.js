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
        name: 'generate',
        description: 'Generate teams for a match.',
        options:
            [
                {
                    name: 'game',
                    description: 'The game you are generating teams for. Choose \"RL\" for \"Rocket League\", or \"VAL\" for \"Valorant\".',
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
                    required: true
                }
            ]
    },
    {
        name: 'join',
        description: 'Join the current queue.',
        options:
            [
                {
                    name: 'game',
                    description: 'The game you are joining the queue for. Choose \"RL\" for \"Rocket League\", or \"VAL\" for \"Valorant\".',
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
                    required: true
                }
            ]
    },
    {
        name: 'leave',
        description: 'Leave the current queue.',
        options:
            [
                {
                    name: 'game',
                    description: 'The game you are leaving the queue for. Choose \"RL\" for \"Rocket League\", or \"VAL\" for \"Valorant\".',
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
                    required: true
                }
            ]
    },
    {
        name: 'mmr',
        description: 'Get your current MMR.',
        options:
            [
                {
                    name: 'game',
                    description: 'The game you want to get your MMR for. Choose \"RL\" for \"Rocket League\", or \"VAL\" for \"Valorant\".',
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
        name: 'queues',
        description: `List all the current queues.`
    },
    {
        name: 'register',
        description: 'Register your Discord account with our database.',
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
        name: 'shuffle',
        description: 'Shuffle players in the current match.'
    },
    {
        name: 'steal',
        description: 'Steal Mikka\'s money.',
    },


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
