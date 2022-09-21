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
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('edit')
                    .setDescription('Edit a Forum Post')
                    .addChannelOption((option) => option.setName('forum_channel').setDescription('The Forum channel search for the edit inside').setRequired(true))
                    .addStringOption((option) => option.setName('post_id').setDescription('The post ID to edit.').setRequired(true))
                    .addStringOption((option) => option.setName('message').setDescription('The new message to edit.').setRequired(true))
                    .addAttachmentOption((option) => option.setName('image').setDescription('The image attachment for the post.').setRequired(false))
            );
    }

    static trim(string: string, max: number): string {
        return string.length > max ? string.slice(0, max) : string;
    }

    private get _edit_failure(): EmbedBuilder {
        return new EmbedBuilder()
            .setColor(0xff0000)
            .setDescription(`**FAILED** I am missing permissions.\nForum post is not editable.`)
            .setTimestamp()
            .setFooter({ text: this.client.user?.username ?? 'dejj', iconURL: this.client.user?.displayAvatarURL() });
    }
    private get _edit_failure_another_user(): EmbedBuilder {
        return new EmbedBuilder()
            .setColor(0xff0000)
            .setDescription(`**FAILED** This message is not posted by the bot.`)
            .setTimestamp()
            .setFooter({ text: this.client.user?.username ?? 'dejj', iconURL: this.client.user?.displayAvatarURL() });
    }

    private get _create_failure(): EmbedBuilder {
        return new EmbedBuilder()
            .setColor(0xff0000)
            .setDescription(`**FAILED** I am missing permissions.`)
            .setTimestamp()
            .setFooter({ text: this.client.user?.username ?? 'dejj', iconURL: this.client.user?.displayAvatarURL() });
    }

    async run(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild() && !interaction.isChatInputCommand()) return;
        const _subcommand = interaction.options.getSubcommand(true);
        if (_subcommand === 'edit') {
            await interaction.deferReply({ ephemeral: false });
            const _edit_forum_channel = interaction.options.getChannel('forum_channel', true);
            const _edit_post_id = interaction.options.getString('post_id', true);
            const _edit_post_message = interaction.options.getString('message', true);
            const _cached_channel = await interaction.guild?.channels.cache.get(_edit_forum_channel.id)?.fetch(true);
            const _image = interaction.options.getAttachment('image', false);

            if (_cached_channel?.type === ChannelType.GuildForum) {
                const _cached_thread_post = await _cached_channel.threads.fetch(_edit_post_id);
                _cached_thread_post?.archived && _cached_thread_post ? _cached_thread_post.setArchived(false) : void 0; // Unarchive post if its closed forcefully
                const _cached_message = await _cached_thread_post?.messages.fetch(_edit_post_id);
                if (_cached_message && !_cached_message.editable) {
                    return interaction.editReply({ embeds: [this._edit_failure_another_user] });
                }
                _cached_message
                    ?.edit(_image ? { content: _edit_post_message, files: [_image ?? null] } : { content: _edit_post_message })
                    .then(() => {
                        const _edit_success = new EmbedBuilder()
                            .setColor(0x00ff00)
                            .setDescription(`Forum post **${_cached_thread_post}** edited successfully inside of **${_edit_forum_channel}**.`)
                            .setTimestamp()
                            .setFooter({ text: this.client.user?.username ?? 'dejj', iconURL: this.client.user?.displayAvatarURL() });
                        return interaction.editReply({ embeds: [_edit_success] });
                    })
                    .catch((error) => {
                        return interaction.editReply({ embeds: [this._edit_failure] });
                    });
            } else {
                const _non_forum_channel_embed = new EmbedBuilder()
                    .setColor(this.client.color)
                    .setDescription(`**${_cached_channel?.name}** is not a forum channel.`)
                    .setTimestamp()
                    .setFooter({ text: this.client.user?.username ?? 'dejj', iconURL: this.client.user?.displayAvatarURL() });
                return interaction.editReply({ embeds: [_non_forum_channel_embed] });
            }
            // return interaction.editReply({ embeds: [this._edit_success] });
        } else if (_subcommand === 'create') {
            const _title = interaction.options.getString('title', true);
            const _forum = interaction.options.getChannel('channel', true);
            const _body = interaction.options.getString('body', true);
            const _image = interaction.options.getAttachment('image', false);

            // Send message if the channel requested is not a forum channel.
            const _non_forum_channel_embed = new EmbedBuilder()
                .setColor(this.client.color)
                .setDescription(`**${_forum}** is not a forum channel.`)
                .setTimestamp()
                .setFooter({ text: this.client.user?.username ?? 'dejj', iconURL: this.client.user?.displayAvatarURL() });
            await interaction.deferReply({ ephemeral: false });
            if (_forum.type !== ChannelType.GuildForum) return interaction.editReply({ embeds: [_non_forum_channel_embed] });

            // Handle creation of forum posts
            const _success_embed = new EmbedBuilder()
                .setColor(this.client.color)
                .setDescription(`Forum post **${_title}** created successfully inside of **${_forum}**.`)
                .setTimestamp()
                .setFooter({ text: this.client.user?.username ?? 'dejj', iconURL: this.client.user?.displayAvatarURL() });

            const _cached_channel = interaction.guild?.channels.cache.get(_forum.id);

            if (_cached_channel?.type === ChannelType.GuildForum && interaction.commandName) {
                _cached_channel.threads
                    .create({
                        name: _title,
                        autoArchiveDuration: 10080,
                        message: _image ? { content: _body, files: [_image ?? null] } : { content: _body },
                    })
                    .then((call) => {
                        interaction.editReply({ embeds: [_success_embed] });
                        return;
                    })
                    .catch(() => {
                        interaction.editReply({ embeds: [this._create_failure] });
                        return;
                    });
            }
        }
    }
}
