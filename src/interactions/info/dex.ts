import { CommandInteraction } from "discord.js";
import { KauriClient } from "../../lib/client/KauriClient";
import { KauriInteraction } from "../../lib/commands/KauriInteraction";
import { CommandExecutionError } from "../../lib/misc/CommandExecutionError";
import { Pokemon } from "../../models/Pokemon";

export default class extends KauriInteraction {
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

    const arg = await this.client.urpg.species.fetchClosest(species);
    const pokemon = new Pokemon(arg.value);

    if (!arg) throw new CommandExecutionError(`No Pokemon found matching \`${species}\``);
    this.client.logger.info({
      key: interaction.commandName,
      query: species,
      result: pokemon.name
    });

    return interaction.reply(await pokemon.dex(this.client as KauriClient, species, arg.rating));
  }
}