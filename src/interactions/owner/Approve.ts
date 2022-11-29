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
    }

    async run(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        const trialee: User = interaction.options.getUser('trialee', true);
        const role: string = interaction.options.getString('role', true);

        const { channels, colours, roles, stripRole } = this.client.util;

        const applicationChannel = await this.client.channels.fetch(channels.applications) as TextChannel;

        // Give Ready For Trial
        let trialeeMember = await interaction.guild?.members.fetch(trialee.id);
        const readyForTrial = stripRole(roles.readyForTrial);
        await trialeeMember?.roles.add(readyForTrial);

        const roleId = stripRole(roles[role]);

        const successEmbed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() || '' })
            .setColor(colours.discord.green)
            .setTitle('Application Approved!')
            .setDescription(`
            **Applicant:** <@${trialee.id}>
            **Role:** <@&${roleId}>
            `);
        await applicationChannel.send({ embeds: [successEmbed] });

        const replyEmbed = new EmbedBuilder()
            .setTitle('Application Approved!')
            .setColor(colours.discord.green)
            .setDescription(`
            **Status:** ✅
            `);
        await interaction.editReply({ embeds: [replyEmbed] });

        // Attempt to DM a notification to trialee.
        const dmEmbed = new EmbedBuilder()
            .setTitle('Your application to Nex AoD has been approved!')
            .setColor(colours.discord.green)
            .setDescription(`
            Follow the instructions and pick a trial date in <#${channels.trialSignup}>
            `);
        await trialee.send({ embeds: [dmEmbed] });
    }
}