import { Listener } from "discord-akairo";
import { readFileSync } from "fs";
import { KauriClient } from "../../lib/KauriClient";
import { Settings } from "../../models/mongo/settings";
export default class extends Listener {
  constructor() {
    super("ready", {
      emitter: "client",
      event: "ready"
    });
  }

  public async exec() {
    this.client.logger.info(`[Ready] Logged in as "${this.client.user?.username}"`);

    const { version } = JSON.parse(readFileSync("./package.json", "utf-8"));
    const devtech = this.client.channels.cache.get("420675341036814337");
    if (devtech?.isText()) devtech.send(`Restarted. Current version: ${version}`);

    for (const [guild_id, guild] of this.client.guilds.cache) {
      if (!this.client.settings?.has(guild_id)) {
        const config = await Settings.create({ guild_id, commands: [] });
        this.client.settings?.set(guild_id, config);
      }
    }
  }
}
