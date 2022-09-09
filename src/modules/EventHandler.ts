import { readdirSync } from 'fs';
import Bot from '../Bot';
import { BotEvent } from '../types/BotEvent';

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
        client.on('shardReconnecting', (id) => this.client.logger.log({ message: `Shard ${id} Shard Reconnecting`, handler: this.constructor.name }));
        client.on('shardResumed', (id, rep) => this.client.logger.log({ message: `Shard ${id} Shard Resume | ${rep} events replayed`, handler: this.constructor.name }));
        client.on('shardReady', (id) => this.client.logger.log({ message: `Shard ${id} | Shard Ready`, handler: this.constructor.name }));
    }

    build() {
        if (this.built) return this;
        const events = readdirSync(this.client.location + '/src/events');
        let index = 0;
        let disabledIndex = 0;
        for (let event of events) {
            const Event = require(`../events/${event}`);
            const ClientEvent: BotEvent = new Event(this.client);

            if (ClientEvent.enabled) {
                const exec = ClientEvent.run.bind(event);
                ClientEvent.fireOnce ? this.client.once(ClientEvent.name, ClientEvent.run.bind(event)) : this.client.on(ClientEvent.name, exec);
                index++;
            } else if (!ClientEvent.enabled) {
                disabledIndex++;
            }
        }
        this.client.logger.log({ message: `Loaded ${index} client event(s)`, handler: this.constructor.name });
        this.client.logger.log({ message: `${disabledIndex} disabled client event(s)`, handler: this.constructor.name });
        this.built = true;
        return this;
    }
}
