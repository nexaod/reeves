import BotInteraction from '../../types/BotInteraction';
import { ChatInputCommandInteraction, Guild, Collection, GuildMember, Role, SlashCommandBuilder, SlashCommandBooleanOption } from 'discord.js';
import type { MasteryData } from '../../types/MasteryData';
// import { PaginatedMessage } from '@sapphire/discord.js-utilities';

export default class Mastery extends BotInteraction {
    get name() {
        return 'mastery';
    }

    get description() {
        return 'Mastery related information and commands.';
    }

    get permissions() {
        return 'staff';
    }

    get slashData() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addBooleanOption((option: SlashCommandBooleanOption) => option.setName('cache').setDescription('Force Fetch cache data').setRequired(true));
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

    private async memberCache(option: boolean | null): Promise<Guild | undefined> {
        if (option) {
            const guild: Guild | undefined = this.client.guilds.cache.get(this.client.util.config.pvmeData.pvme_guild_id);
            const members: Collection<string, GuildMember> | undefined = await guild?.members.fetch();
            if (guild && members) return guild;
            else return undefined;
        } else {
            const guild: Guild | undefined = this.client.guilds.cache.get(this.client.util.config.pvmeData.pvme_guild_id);
            return guild;
        }
    }

    private async roleCache(option: boolean | null): Promise<Collection<string, Role> | null> {
        const _memberCache = await this.memberCache(option);
        const roles = _memberCache?.roles.cache;
        // console.log(roles);
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
        const _grandmaster = role_cache.filter((role) => role.name.toLowerCase().includes('grandmaster'));
        for await (const [, role] of _grandmaster) {
            mapped_stats.grandmaster.push(`${role.name}: '${role.members.size}' members.`);
        }
        const _master = role_cache.filter((role) => role.name.includes(' Master'));
        for await (const [, role] of _master) {
            mapped_stats.master.push(`${role.name}: '${role.members.size}' members.`);
        }
        const _adept = role_cache.filter((role) => role.name.toLowerCase().includes('adept'));
        for await (const [, role] of _adept) {
            mapped_stats.adept.push(`${role.name}: '${role.members.size}' members.`);
        }
        const _apprentice = role_cache.filter((role) => role.name.toLowerCase().includes('apprentice'));
        for await (const [, role] of _apprentice) {
            mapped_stats.apprentice.push(`${role.name}: '${role.members.size}' members.`);
        }
        const _initiate = role_cache.filter((role) => role.name.toLowerCase().includes('initiate'));
        for await (const [, role] of _initiate) {
            mapped_stats.initiate.push(`${role.name}: '${role.members.size}' members.`);
        }
        const _novice = role_cache.filter((role) => role.name.toLowerCase().includes('novice'));
        for await (const [, role] of _novice) {
            mapped_stats.novice.push(`${role.name}: '${role.members.size}' members.`);
        }

        return mapped_stats;
    }

    async run(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return void 0;
        const option = interaction.options.getBoolean('cache');
        await interaction.deferReply({ ephemeral: false });
        const roles: Collection<string, Role> | null = await this.roleCache(option ?? null);
        if (roles) {
            // const page = new this.client.util.paginate();
            // const page = new PaginatedMessage();
            const m = await this.parseRoles(roles);
            const mr = Object.keys(m).map((c) => ({ name: `${c.slice(0, 1).toUpperCase()}${c.slice(1, c.length)}`, roles: m[c as keyof MasteryData] })) as { name: string; roles: string[] }[];
            for (const r of mr) {
                await interaction.followUp(`${r.name}:\n\`\`\`json\n${r.roles.join('\n')}\`\`\``);
            }
        }
    }
}
