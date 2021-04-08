import { CommandInteraction, MessageEmbed, Snowflake } from "discord.js";
import { KauriInteraction } from "../../lib/commands/KauriInteraction";
import { CommandExecutionError } from "../../lib/misc/CommandExecutionError";
import { EmbedColors } from "../../util/constants";

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
      ownerOnly: true,
      clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "MANAGE_ROLES"]
    });
  }

  public async exec(interaction: CommandInteraction & { guildID: Snowflake }, args: Map<string, any>) {
    const action = interaction.options.find(o => o.name === "action")?.value as string;
    const memberID = interaction.options.find(o => o.name === "member")?.value as Snowflake;
    const roleID = interaction.options.find(o => o.name === "role")?.value as Snowflake;

    if (!action || !memberID || !roleID)
      throw new CommandExecutionError("Command parameters missing");

    const member = await interaction.guild?.members.fetch(memberID);
    if (!member)
      throw new CommandExecutionError("Provided user could not be found in the server");

    this.client.logger.info({
      key: interaction.commandName,
      action,
      member: memberID,
      role: roleID
    });

    await (action === "add" ? member.roles.add(roleID) : member.roles.remove(roleID));
    return interaction.reply(
      new MessageEmbed()
        .setDescription(`<@&${roleID}> ${action === "add" ? "added to" : "removed from"} ${member}`)
        .setColor(EmbedColors.SUCCESS)
    );
  }
}