import EventEmitter = require('events');
import Bot from '../Bot';
import * as uuid from 'uuid';
export interface BotEvent {
    uid: string;
    client: Bot;
    get name(): string;
    get fireOnce(): boolean;
    get enabled(): boolean;
    run(args: unknown): Promise<void>;
}

export abstract class BotEvent extends EventEmitter {
    constructor(client: Bot) {
        super();
        this.client = client;
        this.uid = uuid.v4();
        this.on('error', (error) => client.logger.error(error));
    }
}