import { CommandInteraction, MessageEmbed } from "discord.js";
import { KauriInteraction } from "../../lib/commands/KauriInteraction";
import { CommandExecutionError } from "../../lib/misc/CommandExecutionError";
import { Item } from "../../models/mongo/item";
import { EmbedColors } from "../../util/constants";

export default class extends KauriInteraction {
  constructor() {
    super({
      name: "item",
      description: "Get Infohub data for an item",
      options: [{
        name: "item",
        description: "Name of the item to search for",
        type: "STRING",
        required: true
      }]
    });
  }

  public async exec(interaction: CommandInteraction) {
    const query = interaction.options.find(o => o.name === "item")?.value as string;
    if (!query) throw new CommandExecutionError("Command parameter 'item' not found");

    const item = await Item.findClosest("itemName", query);
    if (!item) throw new CommandExecutionError(`No item found matching \`${query}\``);

    this.client.logger.info({
      key: interaction.commandName,
      query,
      result: item.itemName
    });

    return interaction.reply(item.info());
  }
}