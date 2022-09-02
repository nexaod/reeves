// Import modules.
import { Preload } from "#manager";
import { Client, Options } from "discord.js";
import { readdirSync } from "fs";

/**
 * Create and login to Discord client with custom properties.
 *
 * @param [] None required.
 * @example new Bot()
 */
export default class Bot extends Client {
  public constructor() {
    super({
      restTimeOffset: 100,
      intents: [
        "GUILDS",
        "GUILD_MEMBERS",
        "GUILD_MESSAGES",
        "GUILD_MESSAGE_REACTIONS",
      ],
      makeCache: Options.cacheWithLimits({
        MessageManager: { maxSize: 200, sweepInterval: 5 * 60000 },
      }),
    });

    // Preload and define util functions.
    new Preload(this as any);

    // Load client events.
    for (let event of readdirSync("./lib/events").filter((evt) =>
      evt.endsWith(".js")
    ))
      this.on(event.split(".")[0], (...params) =>
        import(`./events/${event}`).then(
          (event) => new event.default(this, ...params)
        )
      );

    // Login to client.
    this.login(process.env.TOKEN).catch((error) => {
      throw new ReferenceError(error);
    });
  }
}

// Globally define client.
global.Client = new Bot();
