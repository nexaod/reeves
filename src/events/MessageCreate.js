const BotEvent = require('../abstract/BotEvent.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, MessageAttachment, ButtonStyle } = require('discord.js');
const { getVideoMeta } = require('tiktok-scraper');
const { readdirSync } = require('fs');

class MessageCreate extends BotEvent {
    get name() {
        return 'messageCreate';
    }

    get once() {
        return false;
    }

    get enabled() {
        return true;
    }

    async run(message) {
        if (message.author.bot) return;
        if (this.client.util.config.guildMessageDisabled.includes(message.guild.id)) return;
        const [command, ...args] = message.content.split(' ');

        // slash command handler
        if (this.client.util.config.owners.includes(message.author.id) && message.content.startsWith(`<@${this.client.user.id}> build`)) {
            if (message.content.match(/help/gi)) {
                const buildUsage = [
                    '`build` - Build Server Commands',
                    '`build help` - Shows this message',
                    '`build global` - Build Global Commands',
                    '`build removeall` - Remove Global Commands',
                    '`build guild removeall` - Remove Server Commands',
                ];
                return message.reply({ content: buildUsage.join('\n') });
            }

            if (message.content.match(/removeall/gi)) {
                // remove only the guilds commands
                if (message.content.match(/guild/gi))
                    await message.guild.commands.set([]).catch((err) => {
                        this.client.logger.error({ error: err.stack }, err.stack);
                        message.react('❎');
                    });
                // remove all slash commands globally
                else
                    await this.client.application.commands.set([]).catch((err) => {
                        this.client.logger.error({ error: err.stack }, err.stack);
                        message.react('❎');
                    });
                return message.reply({ content: 'Done' });
            }
            let data = [];
            for (const directory of readdirSync(`${this.client.location}/src/interactions`, { withFileTypes: true })) {
                if (!directory.isDirectory()) continue;
                for (const command of readdirSync(`${this.client.location}/src/interactions/${directory.name}`, { withFileTypes: true })) {
                    if (!command.isFile()) continue;
                    const Interaction = require(`${this.client.location}/src/interactions/${directory.name}/${command.name}`);
                    data.push(new Interaction({}).interactionData);
                }
            }
            if (message.content.match(/global/gi)) {
                if (!this.client.application) return message.reply({ content: `There is no client.application?` }).catch(() => {});
                let res = await this.client.application.commands.set(data).catch((e) => e);
                if (res instanceof Error) return this.client.logger.error({ error: res.stack }, res.stack);
                return message.reply({ content: `Deploying (**${data.length.toLocaleString()}**) slash commands, this could take up to 1 hour` }).catch(() => {});
            }
            let res = await message.guild.commands.set(data).catch((e) => e);
            if (res instanceof Error) return this.client.logger.error({ error: res.stack }, res.stack).catch(() => {});
            return message.reply({ content: `Deploying (**${data.length.toLocaleString()}**) slash commands` }).catch(() => {});
        }

        // Nickname util
        if (this.client.util.config.owners.includes(message.author.id) && message.content.startsWith(`<@${this.client.user.id}> nick`)) {
            try {
                message.guild.me.setNickname(args.slice(1).join(' ') || null);
            } catch (error) {
                return message.react('❎');
            }
            return message.react('✅');
        }
    }
}
module.exports = MessageCreate;
