import { ApplicationCommandOption } from 'discord.js';
// import { APIApplicationCommandOptionBase, APIApplicationCommandOption } from 'discord-api-types/v10';
// import { ApplicationCommandOption } from 'discord.js'
import * as uuid from 'uuid';
import Bot from '../Bot';

export default interface BotInteraction {
    new (client: Bot): BotInteraction;
    uid: string;
    client: Bot;
    category: string;
    get name(): string;
    get description(): string;
    get options(): any[] | null;
    get permissions(): ApplicationCommandOption[] | string;
    run(args: unknown): Promise<void>;
}

export default class BotInteraction {
    constructor(client: Bot) {
        this.uid = uuid.v4();
        this.client = client;
    }

    public get interactionData() {
        return {
            name: this.name,
            description: this.description,
            options: this.options,
        };
    }
}
