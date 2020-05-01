import { Listener } from "discord-akairo";
import { Guild } from "discord.js";
import { Settings } from "../../models/settings";

export default class GuildCreateListener extends Listener {
    constructor() {
        super("guildCreate", {
            emitter: "client",
            event: "guildCreate"
        });
    }

    public async exec(guild: Guild) {
        if (!this.client.settings?.has(guild.id)) {
            const config = await Settings.create({ guild_id: guild.id });
            this.client.settings?.set(guild.id, config);
        }
    }
}
