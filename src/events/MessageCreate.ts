import { Message } from 'discord.js';
import BotEvent from '../types/BotEvent.js';
import { readdirSync } from 'fs';
import BotInteraction from '../types/BotInteraction';

export default class MessageCreate extends BotEvent {
    get name() {
        return 'messageCreate';
    }

    get fireOnce() {
        return false;
    }

    get enabled() {
        return true;
    }

    // private async mastery() {
    //     const mastery_map: MasteryData = {
    //         grandmaster: [],
    //         master: [],
    //         adept: [],
    //         apprentice: [],
    //         initiate: [],
    //         novice: [],
    //     };
    //     await this.membersCache();
    //     const roles = this.rolesCache();
    //     if (roles) {
    //         roles.map((role) => {
    //             if (role) {
    //                 console.log({ message: `Role: ${role.name}, Members: ${role.members.size}`, uid: `<Private>#Mastery()` });
    //                 if (role.name.toLowerCase().includes('grandmaster')) {
    //                     mastery_map.grandmaster.push(`'${role.name}': '${role.members.size}' members.`);
    //                 } else if (role.name.includes(' Master')) {
    //                     mastery_map.master.push(`'${role.name}': '${role.members.size}' members.`);
    //                 } else if (role.name.toLowerCase().includes('adept')) {
    //                     mastery_map.adept.push(`'${role.name}': '${role.members.size}' members.`);
    //                 } else if (role.name.toLowerCase().includes('apprentice')) {
    //                     mastery_map.apprentice.push(`'${role.name}': '${role.members.size}' members.`);
    //                 } else if (role.name.toLowerCase().includes('initiate')) {
    //                     mastery_map.initiate.push(`'${role.name}': '${role.members.size}' members.`);
    //                 } else if (role.name.toLowerCase().includes('novice')) {
    //                     mastery_map.novice.push(`'${role.name}': '${role.members.size}' members.`);
    //                 }
    //             }
    //         });
    //     }
    //     return mastery_map;
    // }

    // private async membersCache(): Promise<Collection<string, GuildMember> | undefined> {
    //     return await this.client.guilds.cache.get('534508796639182860')?.members.fetch();
    // }

    // private rolesCache(): Collection<string, Role> | undefined {
    //     return this.client.guilds.cache.get('534508796639182860')?.roles.cache;
    // }

    async run(message: Message): Promise<any> {
        if (message.author.bot) return;
        if (!message.inGuild()) return;
        if (this.client.util.config.guildMessageDisabled.includes(message.guild.id)) return;

        // boop message
        if (message.content.startsWith(`<@${this.client.user?.id}> boop`)) {
            this.client.commandsRun++;
            this.client.logger.log({ message: `${message.author.username} booped the bot.`, uid: `(@${this.uid})` });
            return message.reply({ content: '<a:majjnow:1006284731928805496>' });
        }

        // mastery information
        if (message.content.startsWith(`<@${this.client.user?.id}> mastery`)) {
            // mastery help
            if (message.content.match(/help/gi)) {
                const masteryUsage = [
                    '**This command does nothing at this time**',
                    '`mastery help` - Shows this message',
                    '`mastery current` - Shows all Current Mastery Roles with User Counts',
                    '`mastery reset all` - Removes all users from Mastery Roles',
                ];
                return message.reply({ content: masteryUsage.join('\n') });
            }

            // if (this.client.util.config.owners.includes(message.author.id) && message.content.match(/current/gi)) {
            //     const loading = await message.reply(`Loading information please wait...`);
            //     // const data: MasteryData = await this.mastery();
            //     const trimmed: string = this.client.util.trim(JSON.stringify(data, null, 2), 4000);
            //     const embed = new EmbedBuilder()
            //         .setColor(this.client.color)
            //         .setTitle('Mastery Results')
            //         .setDescription(`\`\`\`js\n${trimmed}\`\`\``)
            //         .setTimestamp()
            //         .setFooter({ text: this.client.user?.username ?? 'dejj', iconURL: this.client.user?.displayAvatarURL() });
            //     loading.edit({ content: 'Mastery data loaded', embeds: [embed] });
            // }
        }

        // slash command handler
        if (this.client.util.config.owners.includes(message.author.id) && message.content.startsWith(`<@${this.client.user?.id}> build`)) {
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
                    await message.guild?.commands.set([]).catch((err) => {
                        this.client.logger.error({ error: err.stack, handler: this.constructor.name });
                        message.react('❎');
                    });
                // remove all slash commands globally
                else
                    await this.client.application?.commands.set([]).catch((err) => {
                        this.client.logger.error({ error: err.stack, handler: this.constructor.name });
                        message.react('❎');
                    });
                return message.reply({ content: 'Done' });
            }

            let data: any[] = [];
            await this.buildCommands(data);

            if (message.content.match(/global/gi)) {
                if (!this.client.application) return message.reply({ content: `There is no client.application?` }).catch(() => {});
                let res = await this.client.application.commands.set(data).catch((e) => e);
                if (res instanceof Error) return this.client.logger.error({ error: res.stack, handler: this.constructor.name });
                return message.reply({ content: `Deploying (**${data.length.toLocaleString()}**) slash commands, this could take up to 1 hour` }).catch(() => {});
            }

            let res = await message.guild.commands.set(data).catch((e) => e);
            if (res instanceof Error) return this.client.logger.error({ error: res.stack, handler: this.constructor.name });
            return message.reply({ content: `Deploying (**${data.length.toLocaleString()}**) slash commands` }).catch(() => {});
        }
    }

    private async buildCommands(data: any[]) {
        for await (const directory of readdirSync(`${this.client.location}/dist/src/interactions`, { withFileTypes: true })) {
            if (!directory.isDirectory()) continue;
            for await (const command of readdirSync(`${this.client.location}/dist/src/interactions/${directory.name}`, { withFileTypes: true })) {
                if (!command.isFile()) continue;
                if (command.name.endsWith('js')) {
                    import(`${this.client.location}/dist/src/interactions/${directory.name}/${command.name}`).then((interaction) => {
                        const Command: BotInteraction = new interaction.default(this.client);
                        Command ? data.push(Command.interactionData) : void 0;
                    });
                }
            }
        }
    }
}
