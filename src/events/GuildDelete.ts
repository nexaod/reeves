import { Guild } from 'discord.js';
import BotEvent from '../types/BotEvent.js';

export default class GuildDelete extends BotEvent {
    get name() {
        return 'guildDelete';
    }

    get fireOnce() {
        return false;
    }

    get enabled() {
        return true;
    }

    async run(guild: Guild): Promise<void> {
        this.client.logger.log({
            handler: this.constructor.name,
            message: `Left guild **${guild.name}** with **${guild.memberCount}** members.`,
        });
        // this.client.logger.log({
        //     constructor: this.constructor.name,
        //     message: 'Left guild',
        //     guildName: guild.name,
        //     guildMembers: guild.memberCount,
        // });
    }
}