import { CommandInteraction, DMChannel, GuildMember } from "discord.js";
import { KauriInteraction } from "../../lib/commands/KauriInteraction";
import { Roles } from "../../util/constants";

interface CommandArgs {
  count: number;
  user: GuildMember;
}

export default class extends KauriInteraction {
  constructor() {
    super({
      name: "purge",
      description: "Bulk deletes messages from the channel",
      options: [{
        name: "amount",
        description: "Number of messages to remove [default/max 100]",
        type: "INTEGER"
      }],
      guild: true,
      defaultPermission: false
    });
  }

  public async exec(interaction: CommandInteraction, { amount = 100 }: Record<string, number>) {
    if (!interaction.channel || !interaction.channel.isText() || !interaction.guild)
      return interaction.reply("No channel detected to delete messages from", { ephemeral: true });

    if (interaction.channel instanceof DMChannel)
      return interaction.reply("This command cannot be used in DMs", { ephemeral: true });

    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);
      this.client.logger.info({
        message: "Messages pruned",
        server: { id: interaction.guild.id, name: interaction.guild.name },
        channel: { id: interaction.channel.id, name: interaction.channel.name },
        deleted: deleted.size,
        key: "prune"
      });
    } catch (e) {
      this.client.logger.parseError(e);
    }
    return true;
  }
}
