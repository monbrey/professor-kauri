import { Guild, MessageEmbed, Structures } from "discord.js";

const EMBED_COLORS: { [index: string]: number } = {
  error: 0xe50000,
  warn: 0xffc107,
  cancel: 0x004a7f,
  success: 0x267f00,
  info: 0xffffff
};

type EmbedTypes = "error" | "warn" | "cancel" | "success" | "info";

declare module "discord.js" {
  interface TextChannel {
    embed(type: EmbedTypes, description?: string): Promise<Message>;
  }
  interface DMChannel {
    embed(type: EmbedTypes, description?: string): Promise<Message>;
  }
  interface NewsChannel {
    embed(type: EmbedTypes, description?: string): Promise<Message>;
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
    public async embed(type: EmbedTypes, description?: string) {
      if (!type) { throw new Error("A popup type must be specified"); }

      const embed = new MessageEmbed({ color: EMBED_COLORS[type] }).setDescription(description);

      return this.send(embed);
    }
  }

  return KauriTextChannel;
});
