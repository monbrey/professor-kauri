import { CommandInteraction, MessageEmbed } from "discord.js";
import { InteractionCommand } from "../../lib/commands/InteractionCommand";
import { CommandExecutionError } from "../../lib/misc/CommandExecutionError";
import { Ability } from "../../models/mongo/ability";
import { EmbedColors } from "../../util/constants";

export default class extends InteractionCommand {
  constructor() {
    super("ability", {
      name: "ability",
      description: "Get Infohub data for an Ability",
      options: [{
        name: "name",
        description: "Name of the Item to search for",
        type: "STRING",
        required: true
      }],
      guild: true
    });
  }

  public async exec(interaction: CommandInteraction) {
    const query = interaction.options.find(o => o.name === "name")?.value as string;
    if (!query)
      throw new CommandExecutionError("Command parameter 'name' not found");

    const ability = await Ability.findClosest("ability", query);
    if (!ability)
      throw new CommandExecutionError(`No Item found matching \`${query}\``);

    this.client.logger.info({
      key: interaction.commandName,
      query,
      result: ability.abilityName
    });

    return interaction.reply(ability.info());
  }
}