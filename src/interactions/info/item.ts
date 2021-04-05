import { CommandInteraction, MessageEmbed } from "discord.js";
import { InteractionCommand } from "../../lib/commands/InteractionCommand";
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
      }],
      guild: true
    });
  }

  public async exec(interaction: CommandInteraction) {
    await interaction.defer();

    const query = interaction.options.find(o => o.name === "name")?.value as string;
    if (!query) return interaction.editReply(
      new MessageEmbed()
        .setDescription("Error executing command - search term not detected")
        .setColor(EmbedColors.ERROR)
    );

    try {
      const item = await Item.findClosest("itemName", query);

      this.client.logger.info({
        key: interaction.commandName,
        query,
        result: item.itemName
      });

      return interaction.editReply(item.info());
    } catch (err) {
      new MessageEmbed()
        .setDescription(`Error executing command:\n${err.message}`)
        .setColor(EmbedColors.ERROR);
    }
  }
}