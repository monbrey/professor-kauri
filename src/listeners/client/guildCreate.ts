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
        const config = this.client.settings!.get(guild.id);

        if (!config) {
            this.client.settings!.add(
                new Settings({ guild_id: guild.id })
            );
        }
    }
}
