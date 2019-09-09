import { Argument } from "discord-akairo";
import { Message } from "discord.js";
import { MessageEmbed } from "discord.js";
import { MessageReaction } from "discord.js";
import { User } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";

export default class LogsCommand extends KauriCommand {
    constructor() {
        super("logs", {
            aliases: ["logs"],
            category: "Config",
            description: "View or change the logging configuration for this server",
            channel: "guild"
        });
    }

    public async exec(message: Message) {
        if (!message.guild) { return; }
        const logConfig = message.guild.logChannel;

        const embed = new MessageEmbed().setTitle(`Log settings for ${message.guild.name}`).setColor("WHITE");
        embed.addField("Log Channel", logConfig ? message.guild.channels.get(logConfig) || "<#invalid_channel>" : "No logging configured");

        if (!message.member!.permissions.has("MANAGE_GUILD", true)) { return await message.util!.send(embed); }

        embed.setFooter("Click the pencil to edit the configuration");
        const sent = await message.util!.send(embed) as Message;
        embed.setFooter("");

        await sent.react("✏");
        const filter = ({ emoji }: MessageReaction, u: User) => emoji.name === "✏" && u.id === message.author!.id;
        const edit = await sent.awaitReactions(filter, { time: 30000, max: 1 });

        sent.reactions.removeAll();
        if (edit.first()) { return this.configureLogging(message, embed); }
    }

    private async configureLogging(message: Message, embed: MessageEmbed) {
        if (!message.guild) { return; }

        const arg1 = new Argument(this, {
            type: "textChannel",
            prompt: {
                start: embed.setColor("GREEN").addField("Which channel should logs go to?", "\u200b"),
                modifyRetry: () => {
                    embed.fields[embed.fields.length - 1].value = "Please mention a valid TextChannel";
                    message.util!.lastResponse!.edit(embed.setColor("ORANGE"));
                    return null;
                },
                modifyEnded: () => {
                    embed.fields[embed.fields.length - 1].value = "No valid TextChannel provided, cancelling command";
                    message.util!.lastResponse!.edit(embed.setColor("DARK_RED"));
                    return null;
                }
            }
        });
        const channel = await arg1.collect(message);
        if (!channel) { return; }

        await this.client.settings.set(message.guild.id, "logs", channel.id);
        message.util!.lastResponse!.delete();
        this.exec(message);
    }
}
