import { Message } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { Item } from "../../models/mongo/item";

interface CommandArgs {
  query: string;
}

export default class ItemCommand extends KauriCommand {
  constructor() {
    super("Item Lookup", {
      aliases: ["item"],
      category: "Info",
      clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      description: "Provides Item information",
      requiresDatabase: true,
      usage: "item <name>"
    });
  }

  public *args() {
    const query = yield {
      type: "string",
      match: "text",
      prompt: {
        start: "> Please provide the name of an Item to lookup"
      }
    };

    return { query };
  }

  public async exec(message: Message, { query }: CommandArgs) {
    try {
      const item = await Item.findClosest("itemName", query);
      console.log(item);
      if (item) {
        this.client.logger.item(message, query, item.itemName);
        return message.util!.send(item.info());
      } else {
        this.client.logger.item(message, item, "none");
        return message.channel.embed("warn", `No results found for ${item}`);
      }
    } catch (e) {
      this.client.logger.parseError(e);
      return message.channel.embed("error", "Error retrieving Item information");
    }
  }
}
