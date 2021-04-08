import { CommandInteraction, MessageEmbed } from "discord.js";
import { KauriInteraction } from "../../lib/commands/KauriInteraction";
import { CommandExecutionError } from "../../lib/misc/CommandExecutionError";
import { Ability } from "../../models/mongo/ability";
import { EmbedColors } from "../../util/constants";

export default class extends KauriInteraction {
  constructor() {
    super({
      name: "ability",
      description: "Get Infohub data for an ability",
      options: [{
        name: "ability",
        description: "Name of the ability to search for",
        type: "STRING",
        required: true
      }],
    });
  }

  public async exec(interaction: CommandInteraction, args: Map<string, any>) {
    const query = interaction.options.find(o => o.name === "ability")?.value as string;
    if (!query)
      throw new CommandExecutionError("Command parameter 'ability' not found");

    const ability = await Ability.findClosest("abilityName", query);
    if (!ability)
      throw new CommandExecutionError(`No ability found matching \`${query}\``);

    this.client.logger.info({
      key: interaction.commandName,
      query,
      result: ability.abilityName
    });

    return interaction.reply(ability.info());
  }
}