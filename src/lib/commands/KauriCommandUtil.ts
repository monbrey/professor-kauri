import { CommandUtil } from "discord-akairo";
import { Message } from "discord.js";
import { MessageEmbed } from "discord.js";

declare module "discord-akairo" {
    interface CommandUtil {
        embed(type: string, content?: string | { [index: string]: string }): Promise<Message>;
    }
}

const EMBED_COLORS: { [index: string]: number } = {
    error: 0xe50000,
    warn: 0xffc107,
    longwarn: 0xffc107,
    cancel: 0x004a7f,
    success: 0x267f00,
    info: 0xffffff
};

Object.defineProperties(CommandUtil.prototype, {
    embed: {
        /**
         * @param {String} type - The type of popup to show
         * @param {String} [description] - Content for the embed
         * @param {Number} [timer] - How long to wait to delete the message in milliseconds
         */
        async value(this: CommandUtil, type: string, content?: string | { [index: string]: string }) {
            if (!type) { throw new Error("A popup type must be specified"); }

            let embed = new MessageEmbed({ color: EMBED_COLORS[type] });
            switch (typeof content) {
                case "string":
                    embed.setDescription(content);
                    break;
                case "object":
                    embed = Object.assign(embed, content);
                    break;
            }

            return this.send(embed);
        }
    }
});
