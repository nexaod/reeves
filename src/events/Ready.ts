// import Bot from '../Bot';
import Bot from '../Bot';
import BotEvent from '../types/BotEvent';
export default class Ready extends BotEvent {
    get name() {
        return 'ready';
    }

    get fireOnce() {
        return true;
    }

    get enabled() {
        return true;
    }

    //test comment
    async run(client: Bot) {
        this.client.logger.log({ message: `[${this.client.user?.username}] Ready! Serving ${this.client.guilds.cache.size} guild(s) with ${this.client.users.cache.size} user(s)` });
        this.client.user?.setActivity("What's the worst that could happen?!");
        const statuses: string[] = ['If you see this, dont look down. :)', 'Always got to make time for tea-time!', 'Burning... Love!', 'Going crazy, too much to do, too little time.'];
        setInterval((): void => {
            const current = statuses.shift() ?? '';
            this.client.user?.setActivity(current);
            statuses.push(current);
        }, 300000);
    }
}
