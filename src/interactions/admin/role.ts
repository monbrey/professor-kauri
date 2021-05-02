import { CommandInteraction, GuildMember, MessageEmbed, Role, Snowflake } from "discord.js";
import { KauriInteraction } from "../../lib/commands/KauriInteraction";
import { CommandExecutionError } from "../../lib/misc/CommandExecutionError";
import { EmbedColors, Roles } from "../../util/constants";

interface CommandArgs {
  action: string;
  member: GuildMember;
  role: Role;
}
export default class extends KauriInteraction {
  constructor() {
    super({
      name: "role",
      description: "Add or remove a Role from a member",
      options: [{
        name: "action",
        description: "Action to take: add | remove",
        type: "STRING",
        choices: [{ name: "add", value: "add" }, { name: "remove", value: "remove" }],
        required: true
      }, {
        name: "member",
        description: "Guild member to action",
        type: "USER",
        required: true
      }, {
        name: "role",
        description: "Role to add or remove",
        type: "ROLE",
        required: true
      }],
      guild: true,
      defaultPermission: false
    });
  }

  public async exec(interaction: CommandInteraction & { guildID: Snowflake }, { action, member, role }: CommandArgs) {
    if (!action || !member || !role)
      throw new CommandExecutionError("Command parameters missing");

    if (!member)
      throw new CommandExecutionError("Provided user could not be found in the server");

    this.client.logger.info({
      key: interaction.commandName,
      action,
      member: member.id,
      role: role.id
    });

    await (action === "add" ? member.roles.add(role) : member.roles.remove(role));
    return interaction.reply(
      new MessageEmbed()
        .setDescription(`${role} ${action === "add" ? "added to" : "removed from"} ${member}`)
        .setColor(EmbedColors.SUCCESS)
    );
  }
}