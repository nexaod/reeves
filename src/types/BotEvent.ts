const EventEmitter = require('events');

class BotEvent extends EventEmitter {
    constructor(client) {
        super();
        this.client = client;
        if (this.constructor === BotEvent) throw new TypeError('Abstract class "BotEvent" cannot be instantiated directly.');
        if (this.name === undefined) throw new TypeError('Classes extending BotEvent must have a getter "name"');
        if (this.once === undefined) throw new TypeError('Classes extending BotEvent must have a getter "once"');
        if (this.enabled === undefined) throw new TypeError('Classes extending BotEvent must have a getter "enabled"');
        if (this.run === undefined) throw new TypeError('Classes extending BotEvent must implement an async function "run"');
        if (this.run.constructor.name !== 'AsyncFunction') throw new TypeError('Classes extending BotEvent must implement "run" as async function');
        this.on('error', (error) => client.logger.error(error));
    }

    exec(...args) {
        this.run(...args).catch((error) => this.emit('error', error));
    }
}
module.exports = BotEvent;
