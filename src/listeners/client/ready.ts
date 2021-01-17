import { Listener } from "discord-akairo";
import { Settings } from "../../models/settings";

export default class ReadyListener extends Listener {
  constructor() {
    super("ready", {
      emitter: "client",
      event: "ready"
    });
  }

  public async exec() {
    this.client.logger.info(`Logged in as "${this.client.user?.username}"`);

    for (const [guild_id, guild] of this.client.guilds.cache) {
      if (!this.client.settings?.has(guild_id)) {
        const config = await Settings.create({ guild_id, commands: [] });
                this.client.settings?.set(guild_id, config);
      }
    }
  }
}
