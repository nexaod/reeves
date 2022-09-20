import { ApplicationCommandOption, SlashCommandBuilder } from 'discord.js';
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
    get slashData(): SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
    get permissions(): ApplicationCommandOption[] | string;
    run(args: unknown): Promise<void>;
}

export default class BotInteraction {
    constructor(client: Bot) {
        this.uid = uuid.v4();
        this.client = client;
    }
}
