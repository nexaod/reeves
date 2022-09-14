import isMaster from 'cluster';
import { webhookUrl } from '../../config.json';
import { WebhookClient } from 'discord.js';

export default interface BotLogger {
    webhookUrl: typeof webhookUrl;
    webhook: WebhookClient;
}

export type BotLog = {
    uid?: string;
    args?: unknown;
    handler?: string;
    message: string;
    error?: unknown;
};

export type BotError = {
    handler?: string;
    message?: string;
    debug?: unknown;
    error: unknown;
};

export default class BotLogger {
    constructor() {
        this.webhookUrl = webhookUrl ?? null;
        if (!this.webhookUrl) throw new Error('Webhook URL is missing in config file.');
        this.webhook = new WebhookClient({ url: webhookUrl });
        this.webhook.send('Health check initialized').catch((reason) => console.log(reason));
    }

    get id() {
        return isMaster ? 'Parent' : process.env.CLUSTER_ID;
    }

    public log(incoming: BotLog): void {
        const _format: string = JSON.stringify(incoming, null, 2);
        this.webhook.send(_format);
        return console.log('[INFO]', _format);
    }

    public error(incoming: BotError): void {
        this.webhook.send(JSON.stringify(incoming));
        return console.log('[ERROR]', incoming);
    }
}
