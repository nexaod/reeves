// Import modules.
import { Events } from '#manager'
import { Message } from 'discord.js'

// Define event interface.
export default interface MessageCreate {
    content: string
    client: ClientExtender | any
    message: Message | any
}

/**
 * <Client> messageCreate event.
 * 
 * @param 
 * @example new messageCreate(<Message>)
 */
export default class MessageCreate extends Events {
    public constructor(client: ClientExtender, message: Message) {
        super({ client, message })

        if (this.message.channel.type.is('DM')) return

        if (this.message.content.is(`${this.client.user?.username.toLowerCase()}?`)) return this.message.reply({ content: `${this.client.user?.username}'s prefix is ${this.client.user?.toString()}`, allowedMentions: { repliedUser: false } })

        if (this.message.content.match(new RegExp(`^(<@!?${this.client.user?.id}>.*)`, 'gm'))?.exists()) {

            this.message.args = this.message.content.split(' ').slice(1)
            this.message.command = this.message.args.shift() ?? ''

            const command = this.client._mention.get(this.message.command)
            command?.run(this.client, this.message).catch(console.log)
        }
    }
}
