const BotEvent = require('../abstract/BotEvent.js');

class GuildDelete extends BotEvent {
    get name() {
        return 'guildDelete';
    }

    get once() {
        return false;
    }

    get enabled() {
        return true;
    }

    async run(guild) {
        if (!guild.available) return;
        this.client.logger.log({
            constructor: this.constructor.name,
            message: 'Left guild',
            guildName: guild.name,
            guildMembers: guild.memberCount,
        });
    }
}
module.exports = GuildDelete;
