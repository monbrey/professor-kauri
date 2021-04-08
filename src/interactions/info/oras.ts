import { Collection, CommandInteraction, MessageEmbed } from "discord.js";
import { KauriInteraction } from "../../lib/commands/KauriInteraction";
import { CommandExecutionError } from "../../lib/misc/CommandExecutionError";

export default class extends KauriInteraction {
  constructor() {
    super({
      name: "oras",
      description: "Get ORAS Contest data for a move",
      options: [{
        name: "move",
        description: "Name of the move to search for",
        type: "STRING",
        required: true
      }],
    });
  }


  public async exec(interaction: CommandInteraction) {
    const query = interaction.options.find(o => o.name === "move")?.value as string;
    if (!query) throw new CommandExecutionError("Command parameter 'move' not found");

    const { value } = await this.client.urpg.attack.fetchClosest(query);
    if (!value) throw new CommandExecutionError(`No move found matching \`${query}\``);

    this.client.logger.info({
      key: interaction.commandName,
      query,
      result: value.name
    });

    const { orasContestAttribute: attribute, orasContestMoveType: { score, jam, description } } = value;

    const embed = new MessageEmbed()
      .setTitle(value.name)
      .addField(`| Attribute: ${attribute} | Score: ${score > 0 ? `+${score}` : `${score}`} | Jam: ${jam} |`, description);

    return interaction.reply(embed);
  }
}