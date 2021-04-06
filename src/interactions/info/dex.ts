import { CommandInteraction } from "discord.js";
import { KauriClient } from "../../lib/client/KauriClient";
import { InteractionCommand } from "../../lib/commands/InteractionCommand";
import { CommandExecutionError } from "../../lib/misc/CommandExecutionError";
import { Pokemon } from "../../models/Pokemon";

export default class extends InteractionCommand {
  constructor() {
    super("dex", {
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


  public async exec(interaction: CommandInteraction) {
    const query = interaction.options.find(o => o.name === "name")?.value as string;
    if (!query) throw new CommandExecutionError("Command parameter 'species' not found");

    const arg = await this.client.urpg.species.fetchClosest(query);
    const pokemon = new Pokemon(arg.value);

    if (!arg) throw new CommandExecutionError(`No Pokemon found matching \`${query}\``);
    this.client.logger.info({
      key: interaction.commandName,
      query,
      result: pokemon.name
    });

    return interaction.reply(await pokemon.dex(this.client as KauriClient, query, arg.rating));
  }
}