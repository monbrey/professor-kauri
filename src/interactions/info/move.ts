import { CommandInteraction, MessageEmbed } from "discord.js";
import { KauriSlashCommand } from "../../lib/commands/KauriSlashCommand";
import { CommandExecutionError } from "../../lib/misc/CommandExecutionError";
import { Move } from "../../models/mongo/move";
import { EmbedColors } from "../../util/constants";

export default class extends KauriSlashCommand {
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

  public async exec(interaction: CommandInteraction, { move }: Record<string, string>) {
    if (!move) throw new CommandExecutionError("Command parameter 'move' not found");

    const value = await Move.findClosest("moveName", move);
    if (!value) throw new CommandExecutionError(`No move found matching \`${move}\``);


    this.client.logger.info({
      key: interaction.commandName,
      query: move,
      result: value.moveName
    });

    await interaction.reply(await value.info());
  }
}