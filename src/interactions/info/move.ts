import { CommandInteraction, MessageEmbed } from "discord.js";
import { KauriInteraction } from "../../lib/commands/KauriInteraction";
import { CommandExecutionError } from "../../lib/misc/CommandExecutionError";
import { Move } from "../../models/mongo/move";
import { EmbedColors } from "../../util/constants";

export default class extends KauriInteraction {
  constructor() {
    super({
      name: "move",
      description: "Look-up Pokemon attack data",
      options: [{
        name: "move",
        description: "Name of the move to search for",
        type: "STRING",
        required: true
      }]
    });
  }

  public async exec(interaction: CommandInteraction) {
    const query = interaction.options.find(o => o.name === "move")?.value as string;
    if (!query) throw new CommandExecutionError("Command parameter 'move' not found");

    const move = await Move.findClosest("moveName", query);
    if (!move) throw new CommandExecutionError(`No move found matching \`${query}\``);


    this.client.logger.info({
      key: interaction.commandName,
      query,
      result: move.moveName
    });

    await interaction.reply(await move.info());
  }
}