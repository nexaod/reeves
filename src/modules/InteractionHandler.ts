import { Dirent, readdirSync } from 'fs';
import { EmbedBuilder, Collection, Interaction, SelectMenuInteraction, Message, InteractionResponse } from 'discord.js';
import Bot from '../Bot';
import BotInteraction from '../types/BotInteraction';
import ButtonHandler from './ButtonHandler';
import EventEmitter = require('events');

export default interface InteractionHandler {
    client: Bot;
    commands: Collection<string, BotInteraction>;
    built: Boolean;
}

export default class InteractionHandler extends EventEmitter {
    constructor(client: Bot) {
        super();
        this.commands = new Collection();
        this.built = false;
        this.client = client;
        this.on('error', (error: unknown) => client.logger.error({ error }));
        this.client.on('interactionCreate', (interaction): Promise<any> => {
            return this.exec(interaction);
        });
    }

    build() {
        if (this.built) return this;
        const dirs = readdirSync(`${this.client.location}/src/interactions`, { withFileTypes: true });
        const name = this.constructor.name;
        const commands = this.commands;
        const client = this.client;
        let cmds: Dirent[] = [];

        walk();

        async function walk() {
            if (!dirs.length) return;
            cmds = readdirSync(`${client.location}/src/interactions/${dirs[0].name}`, { withFileTypes: true }).filter((file) => file.name.endsWith('.ts'));
            await load(dirs[0].name);
            (dirs as Dirent[]).shift();
            walk();
        }

        async function load(dir: string) {
            if (!cmds.length) return;
            await actuallyLoad(dir, cmds[0]);
            (cmds as Dirent[]).shift();
            await load(dir);
        }

        async function actuallyLoad(dir: string, command: Dirent) {
            return new Promise(async (resolve) => {
                if (command.isFile()) {
                    const interaction = await import(`${client.location}/src/interactions/${dir}/${command.name}`);
                    const Command: BotInteraction = new interaction.default(client);
                    commands.set(Command.name, Command);
                    client.logger.log({ message: `Command '${Command.name}' loaded`, handler: name, uid: `(@${Command.uid})` }, false);
                }
                resolve(!0);
            });
        }
        return this;
    }

    // // check to see if the user has at least one of the roles from `pvmeData` in config file
    // public checkPermissions(interaction: Interaction, role_name_or_id?: string[]): boolean {
    //     if (!interaction.inCachedGuild()) return false;
    //     const _roles: string[] = Object.values(this.client.util.config.pvmeData);
    //     const _check: boolean = _roles.map((id) => interaction.member?.roles.cache.some((role) => role_name_or_id?.includes(role.id))).find((e) => e) ?? false;
    //     if (!_check && this.client.util.config.owners.includes(interaction.user.id)) return true; // check if this is TXJ and skip perms check
    //     return _check;
    // }

    // This method will check a `string[]` for name strings
    public checkPermissionName(interaction: Interaction, role_name: string[]): boolean {
        if (!interaction.inCachedGuild()) return false;
        if (this.client.util.config.owners.includes(interaction.user.id)) return true; // if any owner bypass perms check
        const _checkRoleName: boolean[] = role_name.map((role_string) => interaction.member.roles.cache.some((role) => role.name === role_string));
        const _containsRole: boolean = _checkRoleName.some((role) => role === true);
        return _containsRole;
    }

    public checkPermissionID(interaction: Interaction, role_id: string[]): boolean {
        if (!interaction.inCachedGuild()) return false;
        if (this.client.util.config.owners.includes(interaction.user.id)) return true; // if any owner bypass perms check
        const _checkRoleID: boolean[] = role_id.map((role_id) => interaction.member.roles.cache.some((role) => role.id === role_id));
        const _containsRole: boolean = _checkRoleID.some((role) => role === true);
        return _containsRole;
    }

    public async handleSelectMenu(interaction: SelectMenuInteraction<'cached'>): Promise<Message<true> | InteractionResponse<true> | void> {
        if (interaction.customId === 'trialList') {
            await interaction.deferReply({ ephemeral: true });
            await this.client.database.set('name', interaction.values);
            const val = await this.client.database.get('name');
            console.log(val[0]);
            return await interaction.editReply(`${interaction.customId}`);
        }
    }

    async exec(interaction: Interaction): Promise<any> {
        if (interaction.isSelectMenu() && interaction.inCachedGuild()) { return this.handleSelectMenu(interaction) }
        if (interaction.isButton() && interaction.inCachedGuild()) {
            return new ButtonHandler(this.client, interaction.customId, interaction);
        }
        if (interaction.isCommand() && interaction.isRepliable() && interaction.inCachedGuild()) {
            try {
                const command = this.commands.get(interaction.commandName);
                if (!command) return;
                switch (command.permissions) {
                    case 'OWNER':
                        if (interaction.isRepliable() && !this.client.util.config.owners.includes(interaction.user.id)) {
                            this.client.logger.log(
                                {
                                    message: `Attempted restricted permissions. { command: ${command.name}, user: ${interaction.user.username}, channel: ${interaction.channel} }`,
                                    handler: this.constructor.name,
                                },
                                true
                            );
                            return await interaction.reply({ content: 'You do not have permissions to run this command. This incident has been logged.', ephemeral: true });
                        }
                        break;
                    case 'APPLICATION_TEAM':
                        if (!(await this.client.util.hasRolePermissions(this.client, ['applicationTeam', 'mainTrialHost', 'organiser', 'coOwner'], interaction))) {
                            this.client.logger.log(
                                {
                                    message: `Attempted restricted permissions. { command: ${command.name}, user: ${interaction.user.username}, channel: ${interaction.channel} }`,
                                    handler: this.constructor.name,
                                },
                                true
                            );
                            return await interaction.reply({ content: 'You do not have permissions to run this command. This incident has been logged.', ephemeral: true });
                        }
                        break;
                    default:
                        break;
                }
                this.client.logger.log(
                    {
                        handler: this.constructor.name,
                        user: `${interaction.user.username} | ${interaction.user.id}`,
                        message: `Executing Command ${command.name}`,
                        uid: `(@${command.uid})`,
                    },
                    true
                );
                await command.run(interaction);
                this.client.commandsRun++;
            } catch (error: any) {
                const embed = new EmbedBuilder()
                    .setColor(0xff99cc)
                    .setTitle('Something errored!')
                    .setDescription(`\`\`\`js\n ${error.toString()}\`\`\``)
                    .setTimestamp()
                    .setFooter({ text: this.client.user?.username ?? '', iconURL: this.client.user?.displayAvatarURL() });
                this.client.logger.error({
                    handler: this.constructor.name,
                    message: 'Something errored!',
                    error: error.stack,
                });
                interaction.editReply({ embeds: [embed] });
            }
        }
    }
}
