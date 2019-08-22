import { Structures } from "discord.js";
import KauriClient from "../client/KauriClient";

declare module "discord.js" {
    interface Guild {
        client: KauriClient;
        starboard?: any;
        logChannel?: Snowflake;
    }
}

Structures.extend("Guild", Guild => {
    class KauriGuild extends Guild {
        constructor(client: KauriClient, data: any) {
            super(client, data);
        }

        public get starboard() {
            return this.client.settings.get(this.id, "starboard");
        }

        public get logChannel() {
            const logs = this.client.settings.get(this.id, "logs");
            console.log(logs);
            return logs;
        }
    }

    return KauriGuild;
});
