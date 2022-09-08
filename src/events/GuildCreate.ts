const BotEvent = require('../abstract/BotEvent.js');

class GuildCreate extends BotEvent {
    get name() {
        return 'guildCreate';
    }

    get once() {
        return false;
    }

    get enabled() {
        return true;
    }

    async run(guild) {
        this.client.logger.log({
            constructor: this.constructor.name,
            message: 'Joined new Guild',
            guildName: guild.name,
            guildMembers: guild.memberCount,
        });
    }
}
module.exports = GuildCreate;
