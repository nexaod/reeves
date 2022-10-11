import BotInteraction from '../../types/BotInteraction';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export default class Say extends BotInteraction {
    get name() {
        return 'say';
    }

    get description() {
        return 'Talk as the bot';
    }

    get permissions() {
        return 'OWNER';
    }

    get slashData() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) => option.setName('message').setDescription('The message you want to send.').setRequired(true));
    }

    async run(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        const message = interaction.options.getString('message', true);
        await interaction.channel?.send(message);
        await interaction.editReply(`Sent Message: \`\`\`\n${message}\n\`\`\``);
    }
}
