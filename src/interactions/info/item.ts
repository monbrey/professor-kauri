import { CommandInteraction, MessageEmbed } from "discord.js";
import { InteractionCommand } from "../../lib/commands/InteractionCommand";
import { CommandExecutionError } from "../../lib/misc/CommandExecutionError";
import { Item } from "../../models/mongo/item";
import { EmbedColors } from "../../util/constants";

export default class extends InteractionCommand {
  constructor() {
    super("item", {
      name: "item",
      description: "Get Infohub data for an Item",
      options: [{
        name: "name",
        description: "Name of the Item to search for",
        type: "STRING",
        required: true
      }]
    });
  }

  public async exec(interaction: CommandInteraction) {
    const query = interaction.options.find(o => o.name === "name")?.value as string;
    if (!query) throw new CommandExecutionError("Command parameter 'name' not found");

    const item = await Item.findClosest("itemName", query);
    if (!item) throw new CommandExecutionError(`No Item found matching \`${query}\``);

    this.client.logger.info({
      key: interaction.commandName,
      query,
      result: item.itemName
    });

    return interaction.reply(item.info());
  }
}