import { readdirSync } from 'fs';
import { EmbedBuilder, Collection, Interaction } from 'discord.js';
import Bot from '../Bot';
import BotInteraction from '../types/BotInteraction';
import EventEmitter = require('events');

export default interface InteractionHandler {
    client: Bot;
    commands: Collection<String, BotInteraction>;
    built: Boolean;
    on: (...any: any[]) => typeof BotEvent;
}

export default class InteractionHandler extends EventEmitter {
    constructor(client: Bot) {
        super();
        this.commands = new Collection();
        this.built = false;
        this.on('error', (error: unknown) => client.logger.error({ error }));
        this.client.on('interactionCreate', (interaction): Promise<any> => {
            return this.exec(interaction);
        });
    }

    build() {
        if (this.built) return this;
        const directories = readdirSync(`${this.client.location}/src/interactions`, { withFileTypes: true });
        for (const directory of directories) {
            if (!directory.isDirectory()) continue;
            const commands = readdirSync(`${this.client.location}/src/interactions/${directory.name}`, { withFileTypes: true });
            for (const command of commands) {
                if (!command.isFile()) continue;
                const Interaction = require(`${this.client.location}/src/interactions/${directory.name}/${command.name}`);
                const Command = new Interaction(this.client);
                Command.category = directory.name.charAt(0).toUpperCase() + directory.name.substring(1);
                this.commands.set(Command.name, Command);
                this.client.logger.log({ message: `\tCommand '${Command.name}' loaded (@${Command.uid})`, handler: this.constructor.name });
            }
        }
        //this.client.logger.debug(this.constructor.name, `Loaded ${this.commands.size} interaction client command(s)`);
        this.built = true;
        return this;
    }

    async exec(interaction: Interaction): Promise<any> {
        if (interaction.isCommand()) {
            try {
                const command = this.commands.get(interaction.commandName);
                if (!command) return;
                // no perms check before run
                // if (!this.checkPermission(command.permissions, interaction, this.client)) {
                //     return interaction.reply({
                //         content: "You don't have the required permissions to use this command!",
                //         ephemeral: true,
                //     });
                // }

                // general interaction commands
                // this.client.logger.log({
                //     handler: this.constructor.name,
                //     message: `Executing Command ${command.name} [${command.uid}]`,
                //     user: `${interaction.user.username}#${interaction.user.discriminator}`,
                //     userID: interaction.user.id,
                //     guild: interaction.guild.name,
                //     guildID: interaction.guild.id,
                //     channel: interaction.channel?.name,
                //     channelId: interaction.channel?.id,
                // });
                this.client.logger.log({ handler: this.constructor.name, message: `Executing Command ${command.name} [${command.uid}]` });
                await command.run({ interaction });
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
                    error: error.toString(),
                });

                if (interaction.isRepliable() || interaction.isChatInputCommand()) await interaction.editReply({ embeds: [embed] }).catch((error: unknown) => this.emit('error', error));
                else await interaction.reply({ embeds: [embed] }).catch((error: unknown): any => this.emit('error', error));
                this.emit('error', error);
            }
        }
    }
}
