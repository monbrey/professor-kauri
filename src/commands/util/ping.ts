import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class PingCommand extends Command {
    public constructor() {
        super("ping", {
            aliases: ["ping"],
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
