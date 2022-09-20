import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ChannelType } from 'discord.js';
// import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import BotInteraction from '../../types/BotInteraction';

export default class Forum extends BotInteraction {
    get name() {
        return 'forum';
    }

    get description() {
        return 'Forum Posts with the Bot';
    }

    get permissions() {
        return 'SENIOR_EDITORS';
    }

    get slashData() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('create')
                    .setDescription('Creates a Forum Post')
                    .addStringOption((option) => option.setName('title').setDescription('The title of the post.').setRequired(true))
                    .addStringOption((option) => option.setName('body').setDescription('The body of the post.').setRequired(true))
                    .addChannelOption((option) => option.setName('channel').setDescription('The Forum channel to post inside').setRequired(true))
                    .addAttachmentOption((option) => option.setName('image').setDescription('The image of the post.').setRequired(false))
            );
    }

    static trim(string: string, max: number): string {
        return string.length > max ? string.slice(0, max) : string;
    }

    async _create(): Promise<void> {
        return void 0;
    }

    async run(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild() && !interaction.isChatInputCommand()) return;
        const _title = interaction.options.getString('title', true);
        const _forum = interaction.options.getChannel('channel', true);
        const _body = interaction.options.getString('body', true);
        const _image = interaction.options.getAttachment('image', false);
        const _non_forum_channel_embed = new EmbedBuilder()
            .setColor(this.client.color)
            .setDescription(`**${_forum}** is not a forum channel.`)
            .setTimestamp()
            .setFooter({ text: this.client.user?.username ?? 'dejj', iconURL: this.client.user?.displayAvatarURL() });
        await interaction.deferReply({ ephemeral: false });
        if (_forum.type !== 15) return interaction.editReply({ embeds: [_non_forum_channel_embed] });

        const _success_embed = new EmbedBuilder()
            .setColor(this.client.color)
            .setDescription(`Forum post **${_title}** created successfully inside of **${_forum}**.`)
            .setTimestamp()
            .setFooter({ text: this.client.user?.username ?? 'dejj', iconURL: this.client.user?.displayAvatarURL() });
        try {
            const _channelData = interaction.guild?.channels.cache.get(_forum.id);
            if (_channelData?.type === ChannelType.GuildForum) {
                _channelData.threads.create({
                    name: _title,
                    autoArchiveDuration: 10080,
                    message: _image ? { content: _body, files: [_image ?? null] } : { content: _body },
                });
            }
            await interaction.editReply({ embeds: [_success_embed] });
        } catch (error) {
            await interaction.editReply({ content: 'I was unable to create a forum post for you.' });
        }
    }
}
