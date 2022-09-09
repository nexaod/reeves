// import { CommandInteraction } from 'discord.js';
import * as uuid from 'uuid';
import Bot from '../Bot';

export interface Permissions {
    name: string;
    description: string;
    options: string;
}

export default interface BotInteraction {
    uid?: string;
    client: Bot;
    category?: string | null;
    name: string;
    description: string;
    permissions: Permissions;
    run: (incoming: unknown) => Promise<void>;
}

export default class BotInteraction {
    constructor(client: Bot) {
        this.uid = uuid.v4();
        this.client = client;
        this.category = null;
    }
}
