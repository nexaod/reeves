const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const BotInteraction = require('../../abstract/BotInteraction.js');

class Stats extends BotInteraction {
    get name() {
        return 'stats';
    }

    get description() {
        return 'My current info!';
    }

    get memory() {
        const _result = [];
        for (const [key, value] of Object.entries(process.memoryUsage())) {
            _result.push(`${key}: ${value / 1000000}MB`);
        }
        return _result;
    }

    async run({ interaction }) {
        const pingTime = Date.now();
        await interaction.deferReply();

        const embed = new EmbedBuilder()
            .setColor(this.client.color)
            .setTitle('Status')
            .setDescription(
                `\`\`\`ml\n
Guilds      :: ${this.client.guilds.cache.size}
User Count  :: ${this.client.guilds.cache.map((g) => g.memberCount).reduce((a, c) => a + c)}
Channels    :: ${this.client.channels.cache.size}
Ping        :: ${Math.round(Date.now() - pingTime)} MS
Uptime      :: ${this.client.util.convertMS(this.client.uptime)}
CMDs Run    :: ${this.client.commandsRun}
Memory      :: ${JSON.stringify(this.memory, null, 2)}
\`\`\``
            )
            .setTimestamp()
            .setFooter({ text: this.client.user.username, iconURL: this.client.user.displayAvatarURL() });
        await interaction.editReply({ embeds: [embed], components: [] });
    }
}
module.exports = Stats;
