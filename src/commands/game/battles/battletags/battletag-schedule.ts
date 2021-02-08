import { MessageEmbed } from "discord.js";
import { KauriCommand } from "../../../../lib/commands/KauriCommand";
import { KauriMessage } from "../../../../lib/structures/KauriMessage";
import { BattleTag } from "../../../../models/mongo/battletag";

export default class extends KauriCommand {
  constructor() {
    super("battletag-schedule", {
      aliases: ["battletag-schedule"],
      category: "Battles",
      description: "Lists battle tags",
      clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
    });
  }

  public async interact(message: KauriMessage, args: Map<string, any>) {
    const userA = args.get("user-a");
    const userB = args.get("user-b") ?? message.author.id;

    let time;
    try {
      time = await BattleTag.schedule(userA, userB);
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
      .setFooter("Battle scheduled")
      .setDescription(`<@${userA}> and <@${userB}> scheduled to battle`);

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