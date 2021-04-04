import { CommandUtil } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { EmbedColors } from "../../util/constants";

declare module "discord-akairo" {
  interface CommandUtil {
    embed(type: string, content?: string | { [index: string]: string }): Promise<Message>;
  }
}

type EmbedTypes = "error" | "warn" | "cancel" | "success" | "info";

Object.defineProperties(CommandUtil.prototype, {
  embed: {
    /**
         * @param {String} type - The type of popup to show
         * @param {String} [description] - Content for the embed
         * @param {Number} [timer] - How long to wait to delete the message in milliseconds
         */
    async value(this: CommandUtil, type: EmbedTypes, content?: string | { [index: string]: string }) {
      if (!type) { throw new Error("A popup type must be specified"); }

      let embed = new MessageEmbed({ color: EmbedColors[type.toUpperCase()] });
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
