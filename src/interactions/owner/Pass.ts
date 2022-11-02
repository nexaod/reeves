import BotInteraction from '../../types/BotInteraction';
import { ChatInputCommandInteraction, SlashCommandBuilder, TextChannel, User, EmbedBuilder } from 'discord.js';

export default class GiveRole extends BotInteraction {
    get name() {
        return 'pass';
    }

    get description() {
        return 'Records a Trialee Pass';
    }

    get permissions() {
        return 'OWNER';
    }

    get slashData() {
        const RoleOptions: any = [];
        Object.keys(this.client.util.utilities.trialRoles).forEach((key: string) => {
            RoleOptions.push({ name: key, value: this.client.util.utilities.trialRoles[key] })
        })
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption((option) => option.setName('trialee').setDescription('Trialee').setRequired(true))
            .addStringOption((option) => option.setName('role').setDescription('Trialee role').addChoices(
                ...RoleOptions
            ).setRequired(true))
            .addStringOption((option) => option.setName('gem').setDescription('URL for Challenge Gem').setRequired(true))
            .addStringOption((option) => option.setName('comment').setDescription('Comment').setRequired(false));
    }

    async run(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        const trialee: User = interaction.options.getUser('trialee', true);
        const role: string = interaction.options.getString('role', true);
        const gem: string = interaction.options.getString('gem', true);
        const comment: string | null = interaction.options.getString('comment', false);

        const gemScores = await this.client.channels.fetch('1034480950198927380') as TextChannel;
        const trialLog = await this.client.channels.fetch('1034481085700116561') as TextChannel;

        const gemEmbed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() || '' })
            .setColor(this.client.util.utilities.colours.discord.green)
            .setImage(gem)
            .setDescription(`
            **Status:** ✅
            **Trialee:** <@${trialee.id}>
            **Role:** ${this.client.util.utilities.roles[role]}
            `);
        const logEmbed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() || '' })
            .setColor(this.client.util.utilities.colours.discord.green)
            .setDescription(`
            **Status:** ✅
            **Trialee:** <@${trialee.id}>
            **Role:** ${this.client.util.utilities.roles[role]}
            ${comment ? `**Comment:** ${comment}` : ''}
            `);
        await gemScores.send({ embeds: [gemEmbed] });
        await trialLog.send({ embeds: [logEmbed] });

        // Give Primary Role
        const roleId = this.client.util.utilities.functions.stripRole(this.client.util.utilities.roles[role]);
        let trialeeMember = await interaction.guild?.members.fetch(trialee.id);
        await trialeeMember?.roles.add(roleId);

        // Give Member
        const member = this.client.util.utilities.functions.stripRole(this.client.util.utilities.roles['member']);
        await trialeeMember?.roles.add(member);

        // Give Addditional Roles
        this.client.util.utilities.extraRoles[role].forEach(async (extraRole: string) => {
            const extraRoleId = this.client.util.utilities.functions.stripRole(this.client.util.utilities.roles[extraRole]);
            await trialeeMember?.roles.add(extraRoleId);
        })

        const replyEmbed = new EmbedBuilder()
            .setTitle('Trial Recorded!')
            .setColor(this.client.util.utilities.colours.discord.green)
            .setDescription(`
            **Gem Score:** <#${gemScores.id}>
            **Trial Log:** <#${trialLog.id}>
            `);
        await interaction.editReply({ embeds: [replyEmbed] });
    }
}