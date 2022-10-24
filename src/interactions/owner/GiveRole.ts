import BotInteraction from '../../types/BotInteraction';
import { ChatInputCommandInteraction, SlashCommandBuilder, User } from 'discord.js';

export default class GiveRole extends BotInteraction {
    get name() {
        return 'giverole';
    }

    get description() {
        return 'Gives a role to User.';
    }

    get permissions() {
        return 'OWNER';
    }

    get slashData() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption((option) => option.setName('user').setDescription('The user you want to assign a role to.').setRequired(true))
            .addStringOption((option) => option.setName('category').setDescription('The category of role.').addChoices(
                { name: 'Adept', value: '0' },
                { name: 'Mastery', value: '1' },
                { name: 'Extreme', value: '2' },
                { name: 'Kill Count', value: '3' },
            ).setRequired(true))
            .addStringOption((option) => option.setName('role').setDescription('The role you want to assign.').addChoices(
                { name: 'Role 1', value: '0' },
                { name: 'Role 2', value: '1' },
                { name: 'Role 3', value: '2' },
                { name: 'Role 4', value: '3' },
            ).setRequired(true))
            .addBooleanOption((option) => option.setName('hide').setDescription('Do you want to hide this message?').setRequired(false));
    }

    async run(interaction: ChatInputCommandInteraction) {
        const ephemeral: boolean | null = interaction.options.getBoolean('hide', false);
        await interaction.deferReply({ ephemeral: ephemeral ?? true });
        const user: User = interaction.options.getUser('user', true);
        const category: string = interaction.options.getString('category', true);
        const role: string = interaction.options.getString('role', true);

        const message = `${user.username} ${category} ${role}`;
        // const role: Role | APIRole | null = interaction.options.getRole('role_search', false);
        // const _role_members = interaction.guild?.roles.cache.get(role?.id)?.members.size;
        await interaction.editReply({ content: message });
    }
}
