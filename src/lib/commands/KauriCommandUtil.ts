import { CommandUtil } from "discord-akairo";
import { Message } from "discord.js";
import { MessageEmbed } from "discord.js";
import { Collection } from "discord.js";
import { Snowflake } from "discord.js";

declare module "discord-akairo" {
    interface CommandUtil {
        userMessages: Collection<Snowflake, Message>;
        botMessages: Collection<Snowflake, Message>;
        sendPopup(type: string, description?: string | number): Promise<Message>;
    }
}

const EMBED_COLORS: {[index: string]: number} = {
    error: 0xe50000,
    warn: 0xffc107,
    longwarn: 0xffc107,
    cancel: 0x004a7f,
    success: 0x267f00,
    info: 0xffffff
};

Object.defineProperties(CommandUtil.prototype, {
    sendPopup: {
        /**
         * @param {String} type - The type of popup to show
         * @param {String} [description] - Content for the embed
         * @param {Number} [timer] - How long to wait to delete the message in milliseconds
         */
        async value(this: CommandUtil, type: string, description?: string) {
            if (!type) { throw new Error("A popup type must be specified"); }

            const embed = new MessageEmbed({ color: EMBED_COLORS[type] }).setDescription(description);

            return this.send(embed);
        }
    },
    userMessages: {
        get(this: CommandUtil) {
            return this.messages!.filter(m => !m.author!.bot);
        }
    },
    botMessages: {
        get(this: CommandUtil) {
            return this.messages!.filter(m => m.author!.bot);
        }
    }
});
