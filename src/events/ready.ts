// Import modules.
import { Events } from '#manager'
import { Client } from 'discord.js'

// Define event interface.
export default interface Ready {
    user: {
        tag: string
    }
}

/**
 * <Client> ready event.
 * 
 * @param [client] extends from "discord.js" Client.
 * @example new Ready(<Client>)
 */
export default class Ready extends Events {
    public constructor(client: Client) {
        super(client)

        // Log ready event.
        console.log(this.toString())
    }

    private toString() {
        return `${this.user?.tag ?? 'Client'} successfully connected.`
    }
}
