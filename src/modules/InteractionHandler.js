const { readdirSync } = require('fs');
const { EmbedBuilder, InteractionType } = require('discord.js');
const { Collection } = require('@discordjs/collection');
const EventEmitter = require('events');

// holy fuck i actually have brain cancer, this entire file needs to be rewriteen after new whitelists being done

class InteractionHandler extends EventEmitter {
    constructor(client) {
        super();
        this.client = client;
        this.commands = new Collection();
        this.built = false;
        this.on('error', (error) => client.logger.error(error));
        this.client.on('interactionCreate', (interaction) => this.exec(interaction));
    }

    static checkPermission(permissions, interaction, client) {
        if (permissions.includes('OWNER')) return client.util.config.owners.includes(interaction.user.id);
        else return interaction.channel.permissionsFor(interaction.member).has(permissions);
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
                this.client.logger.debug(this.constructor.name, `\tCommand '${Command.name}' loaded (@${Command.uid})`);
            }
        }
        this.client.logger.debug(this.constructor.name, `Loaded ${this.commands.size} interaction client command(s)`);
        this.built = true;
        return this;
    }

    async exec(interaction) {
        const userVoiceJoinable = (await interaction.member.voice?.channel?.joinable) ?? null;
        const userVoiceChannelLimit = (await interaction.member.voice?.channel?.userLimit) ?? null;
        const userVoiceChannelUserCount = (await interaction.member.voice?.channel?.members?.size) ?? null;
        try {
            if (interaction.isCommand()) {
                const command = this.commands.get(interaction.commandName);
                if (!command) return;
                // no perms check before run
                if (command.permissions && !InteractionHandler.checkPermission(command.permissions, interaction, this.client)) {
                    return interaction.reply({
                        content: "You don't have the required permissions to use this command!",
                        ephemeral: true,
                    });
                }

                // general interaction commands
                this.client.logger.log({
                    constructor: this.constructor.name,
                    message: `Executing Command ${command.name}`,
                    commandName: command.name,
                    uid: command.uid,
                    type: interaction.isContextMenuCommand() ? 'ContextMenu' : 'Interaction',
                    user: `${interaction.user.username}#${interaction.user.discriminator}`,
                    userID: interaction.user.id,
                    guild: interaction.guild.name,
                    guildID: interaction.guild.id,
                    channel: interaction.channel.name,
                    channelId: interaction.channel.id,
                });
                await command.run({ interaction });
                this.client.commandsRun++;
            }
        } catch (error) {
            const embed = new EmbedBuilder()
                .setColor(0xff99cc)
                .setTitle('Something errored!')
                .setDescription(`\`\`\`js\n ${error.toString()}\`\`\``)
                .setTimestamp()
                .setFooter({ text: this.client.user.username, iconURL: this.client.user.displayAvatarURL() });
            // TODO: CONVERT TO ERROR
            this.client.logger.log({
                constructor: this.constructor.name,
                message: 'Something errored!',
                error: error.toString(),
            });

            if (interaction.replied || interaction.deferred) await interaction.editReply({ embeds: [embed] }).catch((error) => this.emit('error', error));
            else await interaction.reply({ embeds: [embed] }).catch((error) => this.emit('error', error));
            this.emit('error', error);
        }
    }
}

module.exports = InteractionHandler;
