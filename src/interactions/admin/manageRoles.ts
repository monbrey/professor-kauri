import { CommandInteraction, MessageEmbed, Snowflake } from "discord.js";
import { InteractionCommand } from "../../lib/commands/InteractionCommand";
import { EmbedColors } from "../../util/constants";

export default class extends InteractionCommand {
  constructor() {
    super("role", {
      data: {
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
        }]
      },
      guild: true,
      clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "MANAGE_ROLES"]
    });
  }

  public async exec(interaction: CommandInteraction & { guildID: Snowflake }) {
    await interaction.defer();

    const action = interaction.options.find(o => o.name === "action")?.value as string;
    const memberID = interaction.options.find(o => o.name === "member")?.value as Snowflake;
    const role = interaction.options.find(o => o.name === "role")?.value as Snowflake;

    if (memberID && role) {
      const member = await interaction.guild?.members.fetch(memberID);
      if (member) {
        await (action === "add" ? member.roles.add(role) : member.roles.remove(role));
        return interaction.editReply(
          new MessageEmbed()
            .setDescription(`<@&${role}> ${action === "add" ? "added to" : "removed from"} ${member}`)
            .setColor(EmbedColors.SUCCESS)
        );
      }
    }

    return interaction.editReply(
      new MessageEmbed()
        .setDescription("An error occurred, unable to action role changes")
        .setColor(EmbedColors.ERROR)
    );
  }
}