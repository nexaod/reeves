import { Guild } from 'discord.js';
import BotEvent from '../types/BotEvent.js';

class GuildDelete extends BotEvent {
    get name() {
        return 'guildDelete';
    }

    get fireOnce() {
        return false;
    }

    get enabled() {
        return true;
    }

    run(guild: Guild) {
        if (!guild.available) return;
        // this.client.logger.log({
        //     constructor: this.constructor.name,
        //     message: 'Left guild',
        //     guildName: guild.name,
        //     guildMembers: guild.memberCount,
        // });
    }
}
module.exports = GuildDelete;
