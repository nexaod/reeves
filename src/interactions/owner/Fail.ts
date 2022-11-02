import BotInteraction from '../../types/BotInteraction';
import { ChatInputCommandInteraction, SlashCommandBuilder, TextChannel, User, EmbedBuilder } from 'discord.js';

export default class Fail extends BotInteraction {
    get name() {
        return 'fail';
    }

    get description() {
        return 'Records a Trialee Fail';
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
            .addStringOption((option) => option.setName('gem').setDescription('URL for Challenge Gem').setRequired(false))
            .addStringOption((option) => option.setName('comment').setDescription('Comment').setRequired(false));
    }

    async run(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        const trialee: User = interaction.options.getUser('trialee', true);
        const role: string = interaction.options.getString('role', true);
        const gem: string | null = interaction.options.getString('gem', false);
        const comment: string | null = interaction.options.getString('comment', false);

        const trialLog = await this.client.channels.fetch(this.client.util.utilities.channels.trialLog) as TextChannel;

        const logEmbed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() || '' })
            .setColor(this.client.util.utilities.colours.discord.red)
            .setDescription(`
            **Status:** ❌
            **Trialee:** <@${trialee.id}>
            **Role:** ${this.client.util.utilities.roles[role]}
            ${comment ? `**Comment:** ${comment}` : ''}
            `);
        if (gem) logEmbed.setImage(gem);
        await trialLog.send({ embeds: [logEmbed] });

        const replyEmbed = new EmbedBuilder()
            .setTitle('Trial Recorded!')
            .setColor(this.client.util.utilities.colours.discord.green)
            .setDescription(`
            **Trial Log:** <#${trialLog.id}>
            `);
        await interaction.editReply({ embeds: [replyEmbed] });
    }
}