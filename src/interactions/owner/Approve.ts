import BotInteraction from '../../types/BotInteraction';
import { ChatInputCommandInteraction, SlashCommandBuilder, TextChannel, User, EmbedBuilder } from 'discord.js';

export default class Pass extends BotInteraction {
    get name() {
        return 'approve';
    }

    get description() {
        return 'Approves an application';
    }

    get permissions() {
        return 'APPLICATION_TEAM';
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
    }

    async run(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        const trialee: User = interaction.options.getUser('trialee', true);
        const role: string = interaction.options.getString('role', true);

        const applicationChannel = await this.client.channels.fetch(this.client.util.utilities.channels.applications) as TextChannel;

        // Give Ready For Trial
        let trialeeMember = await interaction.guild?.members.fetch(trialee.id);
        const readyForTrial = this.client.util.utilities.functions.stripRole(this.client.util.utilities.roles.readyForTrial);
        await trialeeMember?.roles.add(readyForTrial);

        const roleId = this.client.util.utilities.functions.stripRole(this.client.util.utilities.roles[role]);

        const successEmbed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() || '' })
            .setColor(this.client.util.utilities.colours.discord.green)
            .setTitle('Application Approved!')
            .setDescription(`
            **Applicant:** <@${trialee.id}>
            **Role:** <@&${roleId}>
            `);
        await applicationChannel.send({ embeds: [successEmbed] });

        const replyEmbed = new EmbedBuilder()
            .setTitle('Application Approved!')
            .setColor(this.client.util.utilities.colours.discord.green)
            .setDescription(`
            **Status:** ✅
            `);
        await interaction.editReply({ embeds: [replyEmbed] });
    }
}