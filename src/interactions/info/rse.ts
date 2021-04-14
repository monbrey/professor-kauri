import { Collection, CommandInteraction, MessageEmbed } from "discord.js";
import { KauriInteraction } from "../../lib/commands/KauriInteraction";
import { CommandExecutionError } from "../../lib/misc/CommandExecutionError";

export default class extends KauriInteraction {
  constructor() {
    super({
      name: "rse",
      description: "Get RSE Contest data for a move",
      options: [{
        name: "move",
        description: "Name of the move to search for",
        type: "STRING",
        required: true
      }],
    });
  }


  public async exec(interaction: CommandInteraction, { move }: Record<string, string>) {
    if (!move) throw new CommandExecutionError("Command parameter 'move' not found");

    const { value } = await this.client.urpg.attack.fetchClosest(move);
    if (!value) throw new CommandExecutionError(`No move found matching \`${move}\``);

    this.client.logger.info({
      key: interaction.commandName,
      query: move,
      result: value.name
    });

    const { rseContestAttribute: attribute, rseContestMoveType: { score, jam, description } } = value;

    const embed = new MessageEmbed()
      .setTitle(value.name)
      .addField(`| Attribute: ${attribute} | Score: ${score > 0 ? `+${score}` : `${score}`} | Jam: ${jam} |`, description);

    return interaction.reply(embed);
  }
}