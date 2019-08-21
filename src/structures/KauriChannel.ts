import { Structures } from "discord.js";
import { Guild } from "discord.js";
import { MessageEmbed } from "discord.js";

const EMBED_COLORS: {[index: string]: number} = {
    error: 0xe50000,
    warn: 0xffc107,
    longwarn: 0xffc107,
    cancel: 0x004a7f,
    success: 0x267f00,
    info: 0xffffff
};

declare module "discord.js" {
    interface TextBasedChannelFields {
        sendPopup(type: string, description?: string | number, timeout?: number): Promise<Message>;
    }
}

Structures.extend("TextChannel", TextChannel => {
    class KauriTextChannel extends TextChannel {
        constructor(guild: Guild, data: any) {
            super(guild, data);
        }

        /**
         * @param {String} type - The type of popup to show
         * @param {String} [description] - Content for the embed
         * @param {Number} [timer] - How long to wait to delete the message in milliseconds
         */
        public async sendPopup(type: string, description?: string | number, timeout?: number) {
            if (!type) { throw new Error("A popup type must be specified"); }
            if (timeout === undefined && typeof description === "number") {
                timeout = description;
                description = undefined;
            }

            const embed = new MessageEmbed({ color: EMBED_COLORS[type] }).setDescription(description);

            return timeout === 0 ? this.send(embed) : this.send(embed).then(m => m.delete({ timeout }));
        }
    }

    return KauriTextChannel;
});
