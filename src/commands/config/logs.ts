import { Argument } from "discord-akairo";
import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { Roles } from "../../util/constants";

export default class LogsCommand extends KauriCommand {
    constructor() {
        super("Logs", {
            aliases: ["logs"],
            category: "Config",
            channel: "guild",
            description: "View or change the logging configuration for this server",
            requiresDatabase: true,
            usage: "logs",
            userRoles: [Roles.Staff]
        });
    }

    public async onBlocked(message: Message) {
        if (!message.guild) { return; }
        const logConfig = message.guild.logChannel;

        const embed = new MessageEmbed().setTitle(`Log settings for ${message.guild.name}`).setColor("WHITE");
        embed.addFields({
            name: "**Log Channel**",
            value: logConfig ? (message.guild.channels.cache.get(logConfig)?.toString() || "<#invalid_channel>") : "No logging configured"
        });

        return message.util!.send(embed);
    }

    public async exec(message: Message) {
        if (!message.guild) { return; }
        const logConfig = message.guild.logChannel;

        const embed = new MessageEmbed().setTitle(`Log settings for ${message.guild.name}`).setColor("WHITE");
        embed.addFields({
            name: "**Log Channel**",
            value: logConfig ? (message.guild.channels.cache.get(logConfig)?.toString() || "<#invalid_channel>") : "No logging configured"
        });
        embed.setFooter("Click the pencil to edit the configuration");

        const sent = await message.util!.send(embed);

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
                start: embed.setColor("GREEN").addFields({ name: "**Which channel should logs go to?**", value: "\u200b" }),
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

        this.client.settings?.get(message.guild.id)?.updateProperty("logs", channel.id);
        message.util!.lastResponse!.delete();
        this.exec(message);
    }
}
