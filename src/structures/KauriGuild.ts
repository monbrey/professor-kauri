import { Structures } from "discord.js";
import { MessageEmbed } from "discord.js";
import KauriClient from "../client/KauriClient";

const EMBED_COLORS: {[index: string]: number} = {
    error: 0xe50000,
    warn: 0xffc107,
    longwarn: 0xffc107,
    cancel: 0x004a7f,
    success: 0x267f00,
    info: 0xffffff
};

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
