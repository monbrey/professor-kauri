import { MessageEmbed } from "discord.js";
import { KauriCommand } from "../../../../lib/commands/KauriCommand";
import { KauriMessage } from "../../../../lib/structures/KauriMessage";
import { BattleTag } from "../../../../models/mongo/battletag";
import { Roles } from "../../../../util/constants";

export default class extends KauriCommand {
  constructor() {
    super("battletag-clear", {
      aliases: ["battletag-clear"],
      category: "Battles",
      description: "Clears a scheduled battle",
      clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      userRoles: [Roles.Referee]
    });
  }

  public async interact(message: KauriMessage, args: Map<string, any>) {
    const userA = args.get("user-a");
    const userB = args.get("user-b");

    try {
      await BattleTag.clear(userA, userB);
    } catch (e) {
      const error = new MessageEmbed().setColor("RED").setDescription(e);
      // @ts-ignore
      return await this.client.api.interactions(message.id)(message.interaction.token).callback.post({
        data: {
          type: 4,
          data: {
            embeds: [error.toJSON()]
          }
        }
      });
    }

    const embed = new MessageEmbed()
      .setFooter("Schedule cleared")
      .setDescription(`<@${userA}> and <@${userB}> are free to challenge again.`);

    // @ts-ignore
    await this.client.api.interactions(message.id)(message.interaction.token).callback.post({
      data: {
        type: 4,
        data: {
          embeds: [embed.toJSON()]
        }
      }
    });
  }
}