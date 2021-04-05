import { CommandInteraction, MessageEmbed } from "discord.js";
import { InteractionCommand } from "../../lib/commands/InteractionCommand";
import { Move } from "../../models/mongo/move";
import { EmbedColors } from "../../util/constants";

export default class extends InteractionCommand {
  constructor() {
    super("move", {
      name: "move",
      description: "Look-up Pokemon attack data",
      options: [{
        name: "name",
        description: "Name of the move to search for",
        type: "STRING",
        required: true
      }]
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
      const move = await Move.findClosest("moveName", query);

      this.client.logger.info({
        key: interaction.commandName,
        query,
        result: move.moveName
      });

      await interaction.editReply(await move.info());
    } catch (err) {
      new MessageEmbed()
        .setDescription(`Error executing command:\n${err.message}`)
        .setColor(EmbedColors.ERROR);
    }
  }
}