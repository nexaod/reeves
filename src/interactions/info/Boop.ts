import BotInteraction from '../../types/BotInteraction';
import { ChatInputCommandInteraction } from 'discord.js';

export default class Boop extends BotInteraction {
    get name() {
        return 'boop';
    }

    get description() {
        return 'Boop the bot.';
    }

    async run(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: false });
        await interaction.editReply(`<a:majjnow:1006284731928805496>`);
    }
}
