import { GatewayIntentBits } from 'discord.js';
import { Indomitable, IndomitableOptions } from 'indomitable';
import { token } from './config.json';
import Bot from './src/Bot';

const { Guilds, GuildMembers, GuildBans, GuildVoiceStates, GuildMessages, GuildMessageReactions } = GatewayIntentBits;

const sharderOptions: IndomitableOptions = {
    clientOptions: {
        // disableMentions: 'everyone',
        // restRequestTimeout: 30000,
        intents: [Guilds, GuildMembers, GuildBans, GuildVoiceStates, GuildMessages, GuildMessageReactions],
    },
    client: Bot as any,
    autoRestart: true,
    token,
    clusterCount: 1,
};

const manager = new Indomitable(sharderOptions).on('error', console.error).on('debug', (message) => {
    console.log(`[ClusterHandler] [Main] ${message}`);
});

manager.spawn();
