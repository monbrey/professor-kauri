import { CommandInteraction, MessageActionRow, MessageButton } from "discord.js";
import { KauriSlashCommand } from "../../lib/commands/KauriSlashCommand";
import { KauriClient } from "../../lib/KauriClient";
import { CommandExecutionError } from "../../lib/misc/CommandExecutionError";
import { Pokemon } from "../../models/Pokemon";

export default class extends KauriSlashCommand {
  constructor() {
    super({
      name: "dex",
      description: "Get Ultradex data for a Pokemon",
      options: [{
        name: "species",
        description: "Pokemon species to search for",
        type: "STRING",
        required: true
      }]
    });
  }


  public async exec(interaction: CommandInteraction, { species }: Record<string, string>) {
    if (!species) throw new CommandExecutionError("Command parameter 'species' not found");

    await interaction.defer();
    const reply = await interaction.fetchReply();

    const arg = await this.client.urpg.species.fetchClosest(species);
    const pokemon = new Pokemon(arg.value);

    if (!arg) throw new CommandExecutionError(`No Pokemon found matching \`${species}\``);
    this.client.logger.info({
      key: interaction.commandName,
      query: species,
      result: pokemon.name
    });

    await interaction.editReply({
      embeds: [await pokemon.dex(this.client as KauriClient, species, arg.rating)],
    });
  }
}