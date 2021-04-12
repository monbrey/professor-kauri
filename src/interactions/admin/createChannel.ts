import { CommandInteraction } from "discord.js";
import { KauriInteraction } from "../../lib/commands/KauriInteraction";
import { Roles } from "../../util/constants";

export default class extends KauriInteraction {
  constructor() {
    super({
      name: "create-channel",
      description: "Create a new channel. Requires content-upkeep role or higher",
      options: [{
        name: "category",
        description: "Category in which to create the channel, or a sibling channel",
        type: "CHANNEL",
        required: true
      }, {
        name: "name",
        description: "Name of the new channel",
        type: "STRING",
        required: true
      }],
      guild: true,
      defaultPermission: false,
      permissions: [{
        id: Roles.ContentUpkeep,
        type: "ROLE",
        permission: true
      }]
    });
  }

  public async exec(interaction: CommandInteraction, args: Map<string, any>) {
    if (!interaction.guild)
      return interaction.reply("This command can only be run in the server", { ephemeral: true });

    const parentID = args.get("category");
    const parent = interaction.guild.channels.cache.get(parentID)?.type === "category" ?
      parentID :
      interaction.guild.channels.cache.get(parentID)?.parentID;

    if (!parent)
      return interaction.reply("Supplied category not found, or supplied channel is not in a category", { ephemeral: true });

    const channel = await interaction.guild.channels.create(args.get("name"), { type: "text", parent });

    interaction.reply(`New channel ${channel} created`, { ephemeral: true });
  }
}