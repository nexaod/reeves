import BotInteraction from '../../types/BotInteraction';
import { ChatInputCommandInteraction, SlashCommandBuilder, TextChannel, User, EmbedBuilder } from 'discord.js';

interface ExtraRoles {
    [key: string]: string[];
}

export default class Pass extends BotInteraction {
    get name() {
        return 'pass';
    }

    get description() {
        return 'Records a Trialee Pass';
    }

    get permissions() {
        return 'OWNER';
    }

    get options() {
        const options: any = [];
        Object.keys(this.client.util.trialRoleOptions).forEach((key: string) => {
            options.push({ name: key, value: this.client.util.trialRoleOptions[key] })
        })
        return options;
    }

    get extraRoles(): ExtraRoles {
        return {
            'magicEnt': ['magicFree'],
            'rangedEnt': ['rangedFree'],
            'meleeEnt': ['meleeFree'],
            'mrEnt': ['mrFree'],
            'mrHammer': ['mrFree'],
        }
    }

    get slashData() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption((option) => option.setName('trialee').setDescription('Trialee').setRequired(true))
            .addStringOption((option) => option.setName('role').setDescription('Trialee role').addChoices(
                ...this.options
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

        const { channels, colours, roles, stripRole } = this.client.util;

        const gemScores = await this.client.channels.fetch(channels.gemScores) as TextChannel;
        const trialLog = await this.client.channels.fetch(channels.trialLog) as TextChannel;

        const gemEmbed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() || '' })
            .setColor(colours.discord.green)
            .setImage(gem)
            .setDescription(`
            **Status:** ✅
            **Trialee:** <@${trialee.id}>
            **Role:** ${roles[role]}
            `);
        const logEmbed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() || '' })
            .setColor(colours.discord.green)
            .setDescription(`
            **Status:** ✅
            **Trialee:** <@${trialee.id}>
            **Role:** ${roles[role]}
            ${comment ? `**Comment:** ${comment}` : ''}
            `);
        await gemScores.send({ embeds: [gemEmbed] });
        await trialLog.send({ embeds: [logEmbed] });

        // Give Primary Role
        const roleId = stripRole(roles[role]);
        let trialeeMember = await interaction.guild?.members.fetch(trialee.id);
        await trialeeMember?.roles.add(roleId);

        // Give Member
        const member = stripRole(roles['member']);
        await trialeeMember?.roles.add(member);

        // Give Addditional Roles
        if (this.extraRoles[role]) {
            this.extraRoles[role].forEach(async (extraRole: string) => {
                const extraRoleId = stripRole(roles[extraRole]);
                await trialeeMember?.roles.add(extraRoleId);
            })
        }

        const replyEmbed = new EmbedBuilder()
            .setTitle('Trial Recorded!')
            .setColor(colours.discord.green)
            .setDescription(`
            **Gem Score:** <#${gemScores.id}>
            **Trial Log:** <#${trialLog.id}>
            `);
        await interaction.editReply({ embeds: [replyEmbed] });
    }
}