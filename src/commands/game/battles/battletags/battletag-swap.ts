import { MessageEmbed } from "discord.js";
import KauriClient from "../../../../client/KauriClient";
import { KauriCommand } from "../../../../lib/commands/KauriCommand";
import { KauriMessage } from "../../../../lib/structures/KauriMessage";
import { BattleTag } from "../../../../models/mongo/battletag";
import { Roles } from "../../../../util/constants";

export default class extends KauriCommand {
  constructor() {
    super("battletag-swap", {
      aliases: ["battletag-swap"],
      category: "Battles",
      description: "Swaps battle tags between two battlers",
      clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      userRoles: [Roles.Approver, Roles.Referee]
    });
  }

  public async interact(message: KauriMessage, args: Map<string, any>) {
    const userA = args.get("user-a");
    const userB = args.get("user-b");

    const battleTags = await BattleTag.swap(userA, userB);

    const embed = new MessageEmbed()
      .setFooter("Battle Tags swapped")
      .setDescription(`Tag #${battleTags[0].tag} given to <@${battleTags[0].user}>\nTag #${battleTags[1].tag} given to <@${battleTags[1].user}>`);

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