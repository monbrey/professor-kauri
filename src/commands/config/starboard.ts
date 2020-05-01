import { Argument } from "discord-akairo";
import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { Roles } from "../../util/constants";
import { IStarboardConfigDocument } from "../../models/schemas/starboardConfig";

export default class StarboardCommand extends KauriCommand {
    constructor() {
        super("Starboard", {
            aliases: ["starboard"],
            category: "Config",
            channel: "guild",
            description: "View or change the Starboard configuration for this server",
            requiresDatabase: true,
            usage: "starboard",
            userRoles: [Roles.Staff]
        });
    }

    public async onBlocked(message: Message) {
        if (!message.guild) { return; }
        const sbConfig = message.guild.starboard;

        const embed = new MessageEmbed().setTitle(`Starboard settings for ${message.guild.name}`).setColor("WHITE");
        if (sbConfig) {
            embed.addFields([
                { name: "**Channel**", value: message.guild.channels.cache.get(sbConfig.channel)?.toString() || "<#invalid_channel>", inline: true },
                { name: "**Emoji**", value: sbConfig.emoji || "⭐", inline: true },
                { name: "**Reaction Threshold**", value: `${sbConfig.minReacts || 1}`, inline: true }
            ]);
        } else {
            embed.setDescription("No Starboard configuration");
        }

        return message.util?.send(embed);
    }

    public async exec(message: Message): Promise<void> {
        if (!message.guild) { return; }
        const sbConfig = message.guild.starboard;

        const embed = new MessageEmbed().setTitle(`Starboard settings for ${message.guild.name}`).setColor("WHITE");
        if (sbConfig) {
            embed.addFields([
                { name: "**Channel**", value: message.guild.channels.cache.get(sbConfig.channel)?.toString() || "<#invalid_channel>", inline: true },
                { name: "**Emoji**", value: sbConfig.emoji || "⭐", inline: true },
                { name: "**Reaction Threshold**", value: `${sbConfig.minReacts || 1}`, inline: true }
            ]);
        } else {
            embed.setDescription("No Starboard configuration");
            embed.setFooter("Click the pencil to edit the configuration");
        }

        const sent = await message.util!.send(embed) as Message;
        embed.setFooter(null);

        await sent.react("✏");
        const filter = ({ emoji }: MessageReaction, u: User) => emoji.name === "✏" && u.id === message.author!.id;
        const edit = await sent.awaitReactions(filter, { time: 30000, max: 1 });

        sent.reactions.removeAll();
        if (edit.first()) {
            return sbConfig ? this.configureStarboard(message, embed) : this.newStarboard(message, embed);
        }
    }

    private async configureStarboard(message: Message, embed: MessageEmbed): Promise<void> {
        if (!message.guild) { return; }

        const sbConfig = message.guild.starboard || {} as IStarboardConfigDocument;

        const arg1 = new Argument(this, {
            type: ["channel", "emoji", "threshold"],
            prompt: {
                start: embed.setColor("GREEN").addFields({ name: "**Which setting would you like to configure?**", value: "`channel`, `emoji` or `threshold`" }),
                modifyRetry: () => {
                    embed.spliceFields(embed.fields.length - 1, 1, [
                        { name: "Which setting would you like to configure?", value: "Response should be one of `channel`, `emoji` or `threshold`" }
                    ]);
                    message.util!.lastResponse!.edit(embed.setColor("ORANGE"));
                    return null;
                },
                modifyEnded: () => {
                    embed.spliceFields(embed.fields.length - 1, 1, [
                        { name: "Which setting would you like to configure?", value: "No valid setting provided, cancelling command" }
                    ]);
                    message.util!.lastResponse!.edit(embed.setColor("DARK_RED"));
                    return null;
                }
            }
        });
        const setting = await arg1.collect(message);

        switch (setting) {
            case "channel": {
                embed.fields[0].value = "\u200b";
                const arg2 = new Argument(this, {
                    type: "textChannel",
                    prompt: {
                        modifyStart: () => {
                            embed.spliceFields(embed.fields.length - 1, 1, [
                                { name: "Which channel should be used as the Starboard?", value: "\u200b" }
                            ]);
                            message.util!.lastResponse!.edit(embed.setColor("GREEN"));
                            return null;
                        },
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
                const channel = await arg2.collect(message);
                if (!channel) { break; }

                sbConfig["channel"] = channel.id;
                await this.client.settings?.get(message.guild.id)?.updateProperty("starboard", sbConfig);
                message.util!.lastResponse!.delete();
                this.exec(message);
            }
            case "emoji": {
                embed.fields[1].value = "\u200b";
                const arg2 = new Argument(this, {
                    prompt: {
                        modifyStart: () => {
                            embed.spliceFields(embed.fields.length - 1, 1, [
                                { name: "Which emoji will mark worthy messages?", value: "\u200b" }
                            ]);
                            message.util!.lastResponse!.edit(embed.setColor("GREEN"));
                            return null;
                        },
                        modifyRetry: () => {
                            embed.fields[embed.fields.length - 1].value = "Please provide a valid emoji";
                            message.util!.lastResponse!.edit(embed.setColor("ORANGE"));
                            return null;
                        },
                        modifyEnded: () => {
                            embed.fields[embed.fields.length - 1].value = "No valid emoji provided, cancelling command";
                            message.util!.lastResponse!.edit(embed.setColor("DARK_RED"));
                            return null;
                        }
                    }
                });
                const emoji = await arg2.collect(message);
                if (!emoji) { return; }

                sbConfig["emoji"] = emoji;
                await this.client.settings?.get(message.guild.id)?.updateProperty("starboard", sbConfig);
                message.util!.lastResponse!.delete();
                return this.exec(message);
            }
            case "threshold": {
                embed.fields[1].value = "\u200b";
                const arg2 = new Argument(this, {
                    type: "integer",
                    prompt: {
                        modifyStart: () => {
                            embed.spliceFields(embed.fields.length - 1, 1, [
                                { name: "How many reactions are required to be considered worthy?", value: "\u200b" }
                            ]);
                            message.util!.lastResponse!.edit(embed.setColor("GREEN"));
                            return null;
                        },
                        modifyRetry: () => {
                            embed.fields[embed.fields.length - 1].value = "Please provide a valid integer";
                            message.util!.lastResponse!.edit(embed.setColor("ORANGE"));
                            return null;
                        },
                        modifyEnded: () => {
                            embed.fields[embed.fields.length - 1].value = "No valid integer provided, cancelling command";
                            message.util!.lastResponse!.edit(embed.setColor("DARK_RED"));
                            return null;
                        }
                    }
                });
                const min = await arg2.collect(message);
                if (!min) { return; }

                sbConfig["minReacts"] = min;

                await this.client.settings?.get(message.guild.id)?.updateProperty("starboard", sbConfig);

                message.util!.lastResponse!.delete();
                return this.exec(message);
            }
        }
    }

    private async newStarboard(message: Message, embed: MessageEmbed): Promise<void> {
        if (!message.guild) { return; }

        embed.setColor("GREEN").setDescription("");
        embed.addFields([
            { name: "**Channel**", value: "\u200b", inline: true },
            { name: "**Emoji**", value: "\u200b", inline: true },
            { name: "**Reaction Threshold**", value: "\u200b", inline: true }
        ]);

        const arg1 = new Argument(this, {
            type: "textChannel",
            prompt: {
                start: embed.addFields({ name: "**Which channel should be used as the Starboard?**", value: "\u200b" }),
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

        embed.fields[0].value = `${channel}`;

        const arg2 = new Argument(this, {
            prompt: {
                modifyStart: () => {
                    embed.spliceFields(embed.fields.length - 1, 1, [
                        { name: "Which emoji will mark worthy messages?", value: "\u200b" }
                    ]);
                    message.util!.lastResponse!.edit(embed.setColor("GREEN"));
                    return null;
                },
                modifyRetry: () => {
                    embed.fields[embed.fields.length - 1].value = "Please provide a valid emoji";
                    message.util!.lastResponse!.edit(embed.setColor("ORANGE"));
                    return null;
                },
                modifyEnded: () => {
                    embed.fields[embed.fields.length - 1].value = "No valid emoji provided, cancelling command";
                    message.util!.lastResponse!.edit(embed.setColor("DARK_RED"));
                    return null;
                }
            }
        });
        const emoji = await arg2.collect(message);
        if (!emoji) { return; }

        embed.fields[1].value = emoji;

        const arg3 = new Argument(this, {
            type: "integer",
            prompt: {
                modifyStart: () => {
                    embed.spliceFields(embed.fields.length - 1, 1, [
                        { name: "How many reactions are required to be considered worthy?", value: "\u200b" }
                    ]);
                    message.util!.lastResponse!.edit(embed.setColor("GREEN"));
                    return null;
                },
                modifyRetry: () => {
                    embed.fields[embed.fields.length - 1].value = "Please provide a valid integer";
                    message.util!.lastResponse!.edit(embed.setColor("ORANGE"));
                    return null;
                },
                modifyEnded: () => {
                    embed.fields[embed.fields.length - 1].value = "No valid integer provided, cancelling command";
                    message.util!.lastResponse!.edit(embed.setColor("DARK_RED"));
                    return null;
                }
            }
        });

        const min = await arg3.collect(message);
        if (!min) { return; }
        embed.fields[2].value = min;

        embed.spliceFields(embed.fields.length - 1, 1, []);

        await this.client.settings?.get(message.guild.id)?.updateProperty("starboard", {
            channel: channel.id, emoji, minReacts: min
        });

        this.exec(message);
        return;
    }
}
