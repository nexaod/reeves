// Import modules.
import { Client, Message } from "discord.js"

/**
 * All client events should extend this base class.
 */
export default class Events {
    public constructor(...derive: Array<Client | Message | object>) {

        // Merge client parameters with "this" for ease of access.
        Object.mergify(this, ...derive)
    }
}
