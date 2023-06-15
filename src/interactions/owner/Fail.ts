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
        return 'ELEVATED_ROLE';
    }

    get options() {
        const options: any = [];
        Object.keys(this.client.util.trialRoleOptions).forEach((key: string) => {
            options.push({ name: key, value: this.client.util.trialRoleOptions[key] })
        })
        return options;
    }

    get slashData() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption((option) => option.setName('trialee').setDescription('Trialee').setRequired(true))
            .addStringOption((option) => option.setName('role').setDescription('Trialee role').addChoices(
                ...this.options
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

        const { channels, colours, roles } = this.client.util;

        const trialLog = await this.client.channels.fetch(channels.trialLog) as TextChannel;

        const logEmbed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() || '' })
            .setColor(colours.discord.red)
            .setDescription(`
            **Status:** ❌
            **Trialee:** <@${trialee.id}>
            **Role:** ${roles[role]}
            ${comment ? `**Comment:** ${comment}` : ''}
            `);
        if (gem) logEmbed.setImage(gem);
        await trialLog.send({ embeds: [logEmbed] });

        const replyEmbed = new EmbedBuilder()
            .setTitle('Trial Recorded!')
            .setColor(colours.discord.green)
            .setDescription(`
            **Trial Log:** <#${trialLog.id}>
            `);
        await interaction.editReply({ embeds: [replyEmbed] });
    }
}