import { Message, MessageEmbed } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";

export default class PingCommand extends KauriCommand {
  public constructor() {
    super("ping", {
      aliases: ["ping"],
      category: "Util",
      description: "A basic ping command"
    });
  }

  public async exec(message: Message): Promise<Message> {
    const embed = new MessageEmbed({ description: "Pinging..." });

    const response = (await message.util!.send(embed)) as Message;

    embed.description = `API Response: ${response.createdTimestamp - message.createdTimestamp}ms
        Websocket: ${Math.round(this.client.ws.ping)}ms`;

    return response.util!.edit(embed);
  }
}
