import { MessageEmbed } from "discord.js";
import KauriClient from "../../../../client/KauriClient";
import { KauriCommand } from "../../../../lib/commands/KauriCommand";
import { KauriMessage } from "../../../../lib/structures/KauriMessage";
import { BattleTag } from "../../../../models/mongo/battletag";
import { Roles } from "../../../../util/constants";

export default class extends KauriCommand {
  constructor() {
    super("battletag-add", {
      aliases: ["battletag-add"],
      category: "Battles",
      description: "Assigns a tag to a battler",
      clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
      userRoles: [Roles.Approver, Roles.ContentUpkeep, Roles.Referee]
    });
  }

  public async interact(message: KauriMessage, args: Map<string, any>) {
    const battletag = await BattleTag.create({
      user: args.get("user")
    });

    const embed = new MessageEmbed()
      .setFooter("New Battle Tag")
      .setDescription(`Tag #${battletag.tag} issued to <@${args.get("user")}>`);

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