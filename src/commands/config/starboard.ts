import { Argument } from "discord-akairo";
import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { Roles } from "../../util/constants";
import { IStarboardConfigDocument } from "../../models/schemas/starboardConfig";

export default class StarboardCommand extends KauriCommand {
    constructor() {
        super("starboard", {
            aliases: ["starboard"],
            category: "Config",
            description: "View or change the Starboard configuration for this server",
            channel: "guild",
            userRoles: [Roles.Staff]
        });
    }

    public async onBlocked(message: Message) {
        if (!message.guild) { return; }
        const sbConfig = message.guild.starboard;

        const embed = new MessageEmbed().setTitle(`Starboard settings for ${message.guild.name}`).setColor("WHITE");
        if (sbConfig) {
            embed.addField("Channel", message.guild.channels.get(sbConfig.channel) || "<#invalid_channel>", true);
            embed.addField("Emoji", sbConfig.emoji || "⭐", true);
            embed.addField("Reaction Threshold", sbConfig.minReacts || 1, true);
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
            embed.addField("Channel", message.guild.channels.get(sbConfig.channel) || "<#invalid_channel>", true);
            embed.addField("Emoji", sbConfig.emoji || "⭐", true);
            embed.addField("Reaction Threshold", sbConfig.minReacts || 1, true);
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
                start: embed.setColor("GREEN").addField("Which setting would you like to configure?", "`channel`, `emoji` or `threshold`"),
                modifyRetry: () => {
                    embed.spliceField(embed.fields.length - 1, 1, "Which setting would you like to configure?", "Response should be one of `channel`, `emoji` or `threshold`");
                    message.util!.lastResponse!.edit(embed.setColor("ORANGE"));
                    return null;
                },
                modifyEnded: () => {
                    embed.spliceField(embed.fields.length - 1, 1, "Which setting would you like to configure?", "No valid setting provided, cancelling command");
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
                            embed.spliceField(embed.fields.length - 1, 1, "Which channel should be used as the Starboard?", "\u200b");
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
                await this.client.settings!.set(message.guild.id, "starboard", sbConfig);
                message.util!.lastResponse!.delete();
                this.exec(message);
            }
            case "emoji": {
                embed.fields[1].value = "\u200b";
                const arg2 = new Argument(this, {
                    prompt: {
                        modifyStart: () => {
                            embed.spliceField(embed.fields.length - 1, 1, "Which emoji will mark worthy messages?", "\u200b");
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
                await this.client.settings!.set(message.guild.id, "starboard", sbConfig);
                message.util!.lastResponse!.delete();
                return this.exec(message);
            }
            case "threshold": {
                embed.fields[1].value = "\u200b";
                const arg2 = new Argument(this, {
                    type: "integer",
                    prompt: {
                        modifyStart: () => {
                            embed.spliceField(embed.fields.length - 1, 1, "How many reactions are required to be considered worthy?", "\u200b");
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
                await this.client.settings!.set(message.guild.id, "starboard", sbConfig);
                message.util!.lastResponse!.delete();
                return this.exec(message);  
            }
        }
    }

    private async newStarboard(message: Message, embed: MessageEmbed): Promise<void> {
        if (!message.guild) { return; }

        embed.setColor("GREEN").setDescription("");
        embed.addField("Channel", "\u200b", true).addField("Emoji", "\u200b", true).addField("Reaction Threshold", "\u200b", true);

        const arg1 = new Argument(this, {
            type: "textChannel",
            prompt: {
                start: embed.addField("Which channel should be used as the Starboard?", "\u200b"),
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
                    embed.spliceField(embed.fields.length - 1, 1, "Which emoji will mark worthy messages?", "\u200b");
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
                    embed.spliceField(embed.fields.length - 1, 1, "How many reactions are required to be considered worthy?", "\u200b");
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

        embed.spliceField(embed.fields.length - 1, 1);

        await this.client.settings!.set(message.guild.id, "starboard", {
            channel: channel.id, emoji, minReacts: min
        });

        this.exec(message);
        return;
    }
}
