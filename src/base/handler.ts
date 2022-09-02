// Import modules.
import { Client } from 'discord.js'
import { readdirSync } from 'fs'

// Define Handler interface.
export default interface Handler {
    approved: number
    rejected: Array<string>
}

/**
 * All client handlers should extend this base class.
 */
export default class Handler {
    public constructor(client: Client) {

        // Merge client parameters with "this" for ease of access.
        Object.mergify(this, client)
    }

    // Recursively read a provided directory and run the callback function.
    query(root: string, callback: Function, subpath?: string) {
        if (!root || typeof callback !== 'function') return
        const result = readdirSync(`${root}${subpath ?? ''}`).filter(path => !path.endsWith('.d.ts'))
        const files = result.filter(path => path.endsWith('.js'))
        const directories = result.filter(path => !files.includes(path))
        for (const path of directories) this.query(root, callback, `${subpath ?? ''}/${path}`)
        for (const file of files) callback(this, file, subpath?.replace(/^\//g, '') ?? null)
    }
}
