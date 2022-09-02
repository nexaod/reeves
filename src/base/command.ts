// Import modules.
import { Message } from 'discord.js'

// Define Command interface.
export default interface Command {
    client: ClientExtender
    title: string
    about: string
    group: string
    lines: number
}


/**
 * All client commands should extend this base class.
 */
export default class Command {
    public constructor(client: ClientExtender, { title = '', about = '', group = '', lines = 0 }) {
        Object.mergify(this, { client, title, about, lines, group })
    }

    public run(client: ClientExtender, message: Message | any) {
        throw new ReferenceError(`The ${message.command} command does not have a run configuration on ${client.user?.username}.`)
    }
}