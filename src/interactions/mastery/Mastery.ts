import BotInteraction from '../../types/BotInteraction';
import { ChatInputCommandInteraction, Guild, Collection, GuildMember, Role, SlashCommandBuilder } from 'discord.js';
import type { MasteryData } from '../../types/MasteryData';

export default class Mastery extends BotInteraction {
    get name() {
        return 'mastery';
    }

    get description() {
        return 'Mastery related information and commands.';
    }

    get permissions() {
        return 'OWNER';
    }

    get slashData() {
        return new SlashCommandBuilder().setName(this.name).setDescription(this.description);
    }

    // get options() {
    //     return [
    //         {
    //             name: 'code',
    //             type: ApplicationCommandOptionType.String,
    //             description: 'The code you want me to evaluate',
    //             required: true,
    //         },
    //     ];
    // }

    private async memberCache(): Promise<Guild | undefined> {
        const guild: Guild | undefined = this.client.guilds.cache.get(this.client.util.config.pvmeData.pvme_guild_id);
        const members: Collection<string, GuildMember> | undefined = await guild?.members.fetch();
        if (guild && members) return guild;
        else return undefined;
    }

    private async roleCache(): Promise<Collection<string, Role> | null> {
        const _memberCache = await this.memberCache();
        const roles = _memberCache?.roles.cache;
        return roles ?? null;
    }

    private async parseRoles(role_cache: Collection<string, Role>): Promise<MasteryData> {
        const mapped_stats: MasteryData = {
            grandmaster: [],
            master: [],
            adept: [],
            apprentice: [],
            initiate: [],
            novice: [],
        };

        const _cache: Role[] = role_cache.map((role) => role);
        for await (const role of _cache) {
            if (role.name.toLowerCase().includes('grandmaster')) {
                mapped_stats.grandmaster.push(`${role.name}: '${role.members.size}' members.`);
            } else if (role.name.includes(' Master')) {
                mapped_stats.master.push(`${role.name}: '${role.members.size}' members.`);
            } else if (role.name.toLowerCase().includes('adept')) {
                mapped_stats.adept.push(`${role.name}: '${role.members.size}' members.`);
            } else if (role.name.toLowerCase().includes('apprentice')) {
                mapped_stats.apprentice.push(`${role.name}: '${role.members.size}' members.`);
            } else if (role.name.toLowerCase().includes('initiate')) {
                mapped_stats.initiate.push(`${role.name}: '${role.members.size}' members.`);
            } else if (role.name.toLowerCase().includes('novice')) {
                mapped_stats.novice.push(`${role.name}: '${role.members.size}' members.`);
            }
        }

        return mapped_stats;
    }

    async run(interaction: ChatInputCommandInteraction) {
        if (interaction.inCachedGuild()) {
            await interaction.deferReply({ ephemeral: false });
            const _canUseCommand: Collection<string, Role> = interaction.member?.roles.cache.filter((role) => role.id.includes(this.client.util.config.pvmeData.pvme_staff_id));
            if (!_canUseCommand.size) {
                await interaction.editReply(`You must ask PvME Staff to pull this report.`);
                return;
            }
            await interaction.editReply(`Loading role cache...`);
            const roles: Collection<string, Role> | null = await this.roleCache();
            await interaction.editReply(`Done... ${roles?.size} roles found`);
            if (roles) {
                await interaction.editReply(`Starting to parse role mastery data... <a:majjnow:1006284731928805496>`);
                const _mastery = await this.parseRoles(roles);
                await interaction.editReply(`Loaded data, sending...`);
                await interaction.followUp(`\`\`\`json\nGrandmaster: ${_mastery.grandmaster.join('\n')}\n\`\`\``);
                await interaction.followUp(`\`\`\`json\nMaster: ${_mastery.master.join('\n')}\n\`\`\``);
                await interaction.followUp(`\`\`\`json\nAdept: ${_mastery.adept.join('\n')}\n\`\`\``);
                await interaction.followUp(`\`\`\`json\nApprentice: ${_mastery.apprentice.join('\n')}\n\`\`\``);
                await interaction.followUp(`\`\`\`json\nInitiate: ${_mastery.initiate.join('\n')}\n\`\`\``);
                await interaction.followUp(`\`\`\`json\nNovice: ${_mastery.novice.join('\n')}\n\`\`\``);
            } else {
                await interaction.editReply(`There was an error retrieving the role data, contact TXJ`);
                return;
            }
        }
    }
}
