import { RateLimitData } from 'discord.js';

const BotEvent = require('../abstract/BotEvent.js');

class Ratelimit extends BotEvent {
    get name() {
        return 'rateLimit';
    }

    get fireOnce() {
        return false;
    }

    get enabled() {
        return true;
    }

    async run(info: RateLimitData) {
        this.client.logger.debug(
            this.constructor.name,
            '\n' +
                `  Route                    : ${info.route}\n` +
                `  Hash                     : ${info.hash}\n` +
                `  Max Requests             : ${info.limit}\n` +
                `  Timeout                  : ${info.timeToReset}ms\n` +
                `  Global Ratelimit         : ${info.global}`
        );
    }
}
module.exports = Ratelimit;
