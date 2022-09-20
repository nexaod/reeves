import { readdirSync } from 'fs';
import { EmbedBuilder, Collection, Interaction } from 'discord.js';
import Bot from '../Bot';
import BotInteraction from '../types/BotInteraction';
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
        const directories = readdirSync(`${this.client.location}/dist/src/interactions`, { withFileTypes: true });
        for (const directory of directories) {
            if (!directory.isDirectory()) continue;
            const commands = readdirSync(`${this.client.location}/dist/src/interactions/${directory.name}`, { withFileTypes: true });
            for (const command of commands) {
                if (!command.isFile()) continue;
                if (!command.name.endsWith('.js')) continue;
                import(`${this.client.location}/dist/src/interactions/${directory.name}/${command.name}`).then((interaction) => {
                    const Command: BotInteraction = new interaction.default(this.client);
                    Command.category = directory.name.charAt(0).toUpperCase() + directory.name.substring(1);
                    this.commands.set(Command.name, Command);
                    this.client.logger.log({ message: `Command '${Command.name}' loaded`, handler: this.constructor.name, uid: `(@${Command.uid})` });
                });
            }
        }
        return this;
    }

    public checkPermissions(interaction: Interaction): boolean {
        if (!interaction.inCachedGuild()) return false;
        if (this.client.util.config.owners.includes(interaction.user.id)) {
            return true;
        } else if (interaction.member?.roles.cache.some((role) => role.id === this.client.util.config.pvmeData.pvme_staff_id)) {
            return true;
        } else if (interaction.member?.roles.cache.some((role) => role.id === this.client.util.config.pvmeData.pvme_retired_staff_id)) {
            return true;
        } else {
            return false;
        }
    }

    async exec(interaction: Interaction): Promise<any> {
        if (interaction.isCommand()) {
            try {
                const command = this.commands.get(interaction.commandName);
                if (!command) return;
                if (command.permissions) {
                    const _perms = this.checkPermissions(interaction);
                    if (!_perms) {
                        if (interaction.isRepliable() || interaction.isChatInputCommand()) {
                            return await interaction.reply({ content: 'You do not have permissions to run this command, please ask PvME Staff or TXJ to run this command.', ephemeral: true });
                        }
                    }
                }
                this.client.logger.log({
                    handler: this.constructor.name,
                    message: `Executing Command ${command.name}`,
                    uid: `(@${command.uid})`,
                    args: interaction.options.data.map((d) => d.value).toString() ?? '',
                });
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

                if (interaction.isRepliable() || interaction.isChatInputCommand()) {
                    await interaction.editReply({ embeds: [embed] }).catch((error: unknown) => this.emit('error', error));
                } else {
                    this.emit('error', error);
                }
            }
        }
    }
}
