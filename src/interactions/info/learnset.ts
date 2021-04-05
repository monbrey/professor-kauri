import { CommandInteraction, MessageEmbed } from "discord.js";
import { KauriClient } from "../../lib/client/KauriClient";
import { InteractionCommand } from "../../lib/commands/InteractionCommand";
import { Pokemon } from "../../models/Pokemon";
import { EmbedColors } from "../../util/constants";

export default class extends InteractionCommand {
  constructor() {
    super("learnset", {
      name: "learnset",
      description: "Get the movelist for a Pokemon",
      options: [{
        name: "name",
        description: "Name of the Pokemon to search for",
        type: "STRING",
        required: true
      }]
    });
  }


  public async exec(interaction: CommandInteraction) {
    const deferred = await interaction.defer();

    const query = interaction.options.find(o => o.name === "name")?.value as string;
    if (!query) return interaction.editReply(
      new MessageEmbed()
        .setDescription("Error executing command - search term not detected")
        .setColor(EmbedColors.ERROR)
    );

    const arg = await this.client.urpg.species.fetchClosest(query);
    const pokemon = new Pokemon(arg.value);

    this.client.logger.info({
      key: interaction.commandName,
      query,
      result: pokemon.name
    });

    return interaction.editReply(await pokemon.learnset(query, arg.rating));
  }
}