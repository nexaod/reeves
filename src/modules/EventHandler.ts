import { readdirSync } from 'fs';
import Bot from '../Bot';
import BotEvent from '../types/BotEvent';
// import BotInteraction from '../types/BotInteraction';

export default interface EventHandler {
    client: Bot;
    built: boolean;
    // on: (...incoming: any[]) => void;
}
export default class EventHandler {
    constructor(client: Bot) {
        this.client = client;
        this.built = false;
        client.on('shardDisconnect', (event, id) => this.client.logger.log({ message: `Shard ${id} Shard Disconnecting`, handler: this.constructor.name }));
        // client.on('shardReconnecting', (id) => this.client.logger.log({ message: `Shard ${id} Shard Reconnecting`, handler: this.constructor.name }));
        client.on('shardResumed', (id, rep) => this.client.logger.log({ message: `Shard ${id} Shard Resume | ${rep} events replayed`, handler: this.constructor.name }));
        client.on('shardReady', (id) => this.client.logger.log({ message: `Shard ${id} | Shard Ready`, handler: this.constructor.name, uid: `Internal Cluster` }));
    }

    build() {
        if (this.built) return this;
        const events = readdirSync(this.client.location + '/dist/src/events');
        let index = 0;
        let disabledIndex = 0;
        for (let event of events) {
            if (event.endsWith('.js')) {
                import(`${this.client.location}/dist/src/events/${event}`).then((event) => {
                    const botEvent: BotEvent = new event.default(this.client);
                    this.client.logger.log({ message: `Event '${botEvent.name}' loaded.`, handler: this.constructor.name, uid: `(@${botEvent.uid})` });
                    if (botEvent.enabled) {
                        const exec = botEvent.exec.bind(botEvent);
                        this.client[botEvent.fireOnce ? 'once' : 'on'](botEvent.name, exec);
                        index++;
                    } else if (!botEvent.enabled) {
                        disabledIndex++;
                    }
                });
            }
        }
        this.client.logger.log({ message: `Loaded ${index} client event(s)`, handler: this.constructor.name });
        this.client.logger.log({ message: `${disabledIndex} disabled client event(s)`, handler: this.constructor.name });
        this.built = true;
        return this;
    }
}
