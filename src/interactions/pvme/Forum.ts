import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ChannelType, Message } from 'discord.js';
import BotInteraction from '../../types/BotInteraction';

export default class Forum extends BotInteraction {
    count = 0;
    count_blank = 0;
    count_no_attachments_with_content = 0;
    _posts_converted: object[] = [];

    get name() {
        return 'forum';
    }

    get description() {
        return 'Forum Posts with the Bot';
    }

    get permissions() {
        return 'Senior Editor';
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
                    .addChannelOption((option) => option.addChannelTypes(ChannelType.GuildForum).setName('channel').setDescription('The Forum channel to post inside').setRequired(true))
                    .addAttachmentOption((option) => option.setName('image').setDescription('The image of the post.').setRequired(false))
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('edit')
                    .setDescription('Edit a Forum Post')
                    .addChannelOption((option) =>
                        option.addChannelTypes(ChannelType.GuildForum).setName('forum_channel').setDescription('The Forum channel search for the edit inside').setRequired(true)
                    )
                    .addStringOption((option) => option.setName('post_id').setDescription('The post ID to edit.').setRequired(true))
                    .addStringOption((option) => option.setName('message').setDescription('The new message to edit.').setRequired(true))
                    .addAttachmentOption((option) => option.setName('image').setDescription('The image attachment for the post.').setRequired(false))
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('convert')
                    .setDescription('Convert User Forum Post(s) to the Bot')
                    .addChannelOption((option) =>
                        option.addChannelTypes(ChannelType.GuildForum).setName('forum_channel').setDescription('The Forum channel search for the conversion').setRequired(true)
                    )
                    .addBooleanOption((option) => option.setName('delete_posts').setDescription('Delete the old posts').setRequired(true))
                    .addBooleanOption((option) => option.setName('ignore_archived').setDescription('Ignore archived posts').setRequired(true))
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

    private async editForumPost(interaction: ChatInputCommandInteraction) {
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
    }

    private async convertForumPost(interaction: ChatInputCommandInteraction) {
        this._posts_converted = [];
        if (!interaction.inCachedGuild()) return;
        const _forum = interaction.options.getChannel('forum_channel', true);
        const _delete_old_posts = interaction.options.getBoolean('delete_posts', true);
        const _ignore_archived_posts = interaction.options.getBoolean('ignore_archived', true);
        const _get_cached_channel = interaction.guild?.channels.cache.get(_forum.id);

        // Send message if the channel requested is not a forum channel.
        const _non_forum_channel_embed = new EmbedBuilder()
            .setColor(this.client.color)
            .setDescription(`**${_forum}** is not a forum channel.`)
            .setTimestamp()
            .setFooter({ text: this.client.user?.username ?? 'dejj', iconURL: this.client.user?.displayAvatarURL() });

        // Defer Reply
        await interaction.deferReply({ ephemeral: false });

        // Ignore channel if not a ChannelType.GuildForum stop here
        if (_get_cached_channel?.type !== ChannelType.GuildForum) return interaction.editReply({ embeds: [_non_forum_channel_embed] });

        // force the new cache to store archived threads too if the user opted in
        _ignore_archived_posts ? void 0 : await _get_cached_channel.threads.fetchArchived({}, true); // MANAGE_THREADS PERM REQUIRED
        await _get_cached_channel.threads.fetchActive(true);

        // get all threads from the mentioned forum
        const _get_cached_threads = _get_cached_channel.threads;
        const _mapped_user_posts = _get_cached_threads.cache.filter((post) => post.ownerId !== this.client.user?.id);

        // if there is nothing to convert then stop here
        if (_mapped_user_posts.size === 0) return interaction.editReply({ content: `There are no posts to convert` });

        // Loop through the posts ready to convert
        for await (const [old_post_id, post] of _mapped_user_posts) {
            // Fetch the first message of each post
            const _first_message: Message<any> | undefined | null = await post.fetchStarterMessage({ cache: false }).catch((e) => undefined);
            if (_first_message) {
                // Check conditions for each post type clause
                const _attachment = _first_message?.attachments?.first();
                const _has_content = _first_message?.content ? true : false;
                if (_attachment && _has_content) {
                    // has attachment and initial message content
                    const __post = await _get_cached_channel.threads.create({
                        // old_id: post_id,
                        name: post.name,
                        autoArchiveDuration: 10080,
                        message: _attachment ? { content: _first_message?.content, files: [_attachment] } : { content: _first_message?.content },
                    });
                    // push the conversion data to a temp array
                    this._posts_converted.push({ name: __post.name, old_id: old_post_id, new_id: __post.id });
                    _delete_old_posts ? post.delete() : void 0;
                } else if (!_attachment && _has_content) {
                    // does NOT have attachment but HAS content
                    this.count_no_attachments_with_content++;
                    const __post = await _get_cached_channel.threads.create({
                        name: post.name,
                        autoArchiveDuration: 10080,
                        message: { content: _first_message?.content },
                    });
                    // push the conversion data to a temp array
                    this._posts_converted.push(new Object({ name: __post.name, old_id: old_post_id, new_id: __post.id }));
                    _delete_old_posts ? post.delete() : void 0;
                }
            } else {
                // this entire catch block is for catching messages without an initial post
                this.count_blank++;
                const __post = await _get_cached_channel.threads.create({
                    name: post.name,
                    autoArchiveDuration: 10080,
                    message: { content: 'This post has no message, Edit this post with `/forum edit`' },
                });
                this._posts_converted.push(new Object({ name: __post.name, old_id: old_post_id, new_id: __post.id }));
                _delete_old_posts ? post.delete() : void 0;
            }
        }

        const __posts_converted_embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setDescription(
                `**${this._posts_converted.length}** forum post's converted successfully inside of **${_forum}**.\n\n\n\`\`\`json\n${
                    this._posts_converted.length > 25 ? JSON.stringify(this._posts_converted.slice(0, 25), null, 2) : JSON.stringify(this._posts_converted, null, 2)
                }\n\`\`\``
            )
            .setTimestamp()
            .setFooter({ text: this.client.user?.username ?? 'dejj', iconURL: this.client.user?.displayAvatarURL() });

        interaction.followUp({ embeds: [__posts_converted_embed] });
    }

    private async createForumPost(interaction: ChatInputCommandInteraction) {
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
        const _success_embed = new EmbedBuilder().setColor(this.client.color).setDescription(`Forum post **${_title}** created successfully inside of **${_forum}**.`).setTimestamp();

        const _cached_channel = interaction.guild?.channels.cache.get(_forum.id);

        if (_cached_channel?.type === ChannelType.GuildForum && interaction.commandName) {
            _cached_channel.threads
                .create({
                    name: _title,
                    autoArchiveDuration: 10080,
                    message: _image ? { content: _body, files: [_image ?? null] } : { content: _body },
                })
                .then((___post) => {
                    interaction.editReply({ embeds: [_success_embed.setFooter({ text: `Post ID: ${___post.id}`, iconURL: this.client.user?.displayAvatarURL() })] });
                    return;
                })
                .catch(() => {
                    interaction.editReply({ embeds: [this._create_failure] });
                    return;
                });
        }
    }

    async run(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild() && !interaction.isChatInputCommand()) return this.client.logger.error({ error: `There was an error with **${this.constructor.name}**` });
        const _subcommand = interaction.options.getSubcommand(true);
        switch (_subcommand) {
            case 'edit':
                await this.editForumPost(interaction);
                break;
            case 'create':
                await this.createForumPost(interaction);
                break;
            case 'convert':
                await this.convertForumPost(interaction);
                break;
            default:
                interaction.editReply(`Subcommand not defined`);
                break;
        }
    }
}
