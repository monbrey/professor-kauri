import { CommandInteraction, MessageEmbed } from "discord.js";
import { KauriClient } from "../../lib/client/KauriClient";
import { InteractionCommand } from "../../lib/commands/InteractionCommand";
import { Pokemon } from "../../models/Pokemon";
import { EmbedColors } from "../../util/constants";

export default class extends InteractionCommand {
  constructor() {
    super("dex", {
      data: {
        name: "dex",
        description: "Get Ultradex data for a Pokemon",
        options: [{
          name: "name",
          description: "Name of the Pokemon to search for",
          type: "STRING",
          required: true
        }]
      }
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

    const arg = await this.client.urpg.species.fetchClosest(query);
    const pokemon = new Pokemon(arg.value);

    this.client.logger.info({
      key: interaction.commandName,
      query,
      result: pokemon.name
    });

    // @ts-ignore
    return interaction.editReply(await pokemon.dex(this.client as KauriClient, arg, false));
  }
}