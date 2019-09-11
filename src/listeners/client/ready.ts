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
        this.client.logger.info(`Logged in as "${this.client.user!.username}"`);

        for (const [id, guild] of this.client.guilds) {
            const config = await this.client.settings.resolve(id);

            if (!config) {
                this.client.settings.add(new Settings({
                    guild_id: guild.id
                }));
            }
        }
    }
}
