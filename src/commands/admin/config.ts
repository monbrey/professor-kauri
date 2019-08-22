import { stripIndents } from "common-tags";
import { Command } from "discord-akairo";
import { Message } from "discord.js";
import KauriCommand from "../../lib/commands/KauriCommand";
import { ICommandConfigDocument } from "../../models/schemas/commandConfig";

interface CommandArgs {
    type: string;
    target: Command | string;
}

export default class ConfigCommand extends KauriCommand {
    constructor() {
        super("args", {
            aliases: ["config"],
            category: "Admin",
            description: "Change bot configuration in this server.",
            channel: "guild",
            userPermissions: ["ADMINISTRATOR", "MANAGE_GUILD"]
        });
    }

    public *args() {
        const type = yield {
            type: ["starboard", "logs", "command"],
            prompt: {
                start: "> Which config would you like to adjust?>\n`[starboard]` `[logs]` or `[command]`"
            }
        };

        let target;
        switch (type) {
            case "starboard":
                target = yield {
                    prompt: {
                        start: "> `[channel]` `[emoji]` or `[minReacts]`"
                    }
                };
                break;
            case "command":
                target = yield {
                    type: "commandAlias",
                    prompt: {
                        start: "> Enter the name of a commad to configure"
                    }
                };
            case "logs":
                break;
        }

        return { type, target };
    }

    // /**
    //  * Adds the edit controls to a generated RichEmbed
    //  * @param {Message} message
    //  * @param {RichEmbed} info
    //  * @param {BaseCommand} command
    //  */
    // public addEditControls(message, info, command) {
    //     if (command.config.canBeDisabled) {
    //         const enableLine = command.enabledInGuild(message.guild)
    //             ? "\\❌ - Disable this command for the server"
    //             : "\\✅ - Enable this command for the server";
    //         info.addField("Toggles", `${enableLine}`);
    //         info.fields[info.fields.length - 1].value += `
    //         \\🔲 - Edit Channel overrides for this command`;
    //     }
    //     if (command.config.canChangePermissions) {
    //         info.fields[info.fields.length - 1].value += `
    //         \\🚫 - Edit Role restrictions for this command`;
    //     }
    //     info.fields[info.fields.length - 1].value += `
    //     \\🔄 - Reset all server configuration for this command`;

    //     return info;
    // }

    // /**
    //  * Listens to reactions and triggers the command config edit functions
    //  * @param {Message} message - A Discord.Message object
    //  * @param {Message} sent
    //  * @param {BaseCommand} command
    //  */
    // public async configure(message, sent, command) {
    //     const reacts = ["✅", "❌", "🔲", "🚫", "🔄"].filter(e =>
    //         sent.embeds[0].fields[sent.embeds[0].fields.length - 1].value.includes(e)
    //     );
    //     try {
    //         for (const r of reacts) { await sent.react(r); }
    //     } catch (e) {
    //         e.key = "config";
    //         throw e;
    //     }

    //     const filter = (r, u) => reacts.includes(r.emoji.name) && u.id === message.author.id;
    //     try {
    //         const response = await sent.awaitReactions(filter, { time: 30000, max: 1 });
    //         sent.clearReactions();

    //         if (!response.first()) { return; }

    //         await (async () => {
    //             switch (response.first().emoji.name) {
    //                 case "✅":
    //                     return this.toggleCommand(message, command);
    //                 case "❌":
    //                     return this.toggleCommand(message, command);
    //                 case "🔲":
    //                     return this.manageChannels(message, command);
    //                 case "🚫":
    //                     return this.manageRoles(message, command);
    //                 case "🔄":
    //                     return this.reset(command);
    //             }
    //         })();
    //     } catch (e) {
    //         e.key = "config";
    //         throw e;
    //     }

    //     return sent.edit(this.generateCommandInfo(message, command));
    // }

    // public async toggleCommand(message, command) {
    //     const toggle = !command.enabledInGuild(message.guild);
    //     command.config.guilds.set(message.guild.id, toggle);
    //     return command.config.save();
    // }

    // public async manageChannels(message, command) {
    //     const { channels } = message.guild;
    //     const serverConfig = command.enabledInGuild(message.guild);

    //     const embed = new RichEmbed()
    //         .setTitle(`Channel overrides for ${message.client.prefix}${command.name}`)
    //         .setDescription(
    //             stripIndents`Mention channels to add or remove their override
    //             Click \\✅ when finished to save changes, or \\❌ to cancel
    //             Changes will be automatically cancelled after 5 minutes`
    //         )
    //         .addField("Server setting", `${serverConfig ? "Enabled" : "Disabled"} `)
    //         .addField(`Channel overrides (${!serverConfig ? "Enabled" : "Disabled"})`, "\u200B");

    //     const evalOverrides = () => {
    //         const overrides = channels.filter(
    //             c => ![undefined, serverConfig].includes(command.config.channels.get(c.id))
    //         );
    //         embed.fields[embed.fields.length - 1].value = overrides.array().join(" ") || "None";
    //     };

    //     evalOverrides();

    //     const channelEdit = await message.channel.send(embed);

    //     const collector = channelEdit.channel.createMessageCollector(
    //         m => m.author.id === message.author.id
    //     );

    //     collector.on("collect", message => {
    //         for (const id of message.mentions.channels.keyArray()) {
    //             command.config.channels.has(id)
    //                 ? command.config.channels.delete(id)
    //                 : command.config.channels.set(id, !serverConfig);
    //         }
    //         message.delete();
    //         evalOverrides();
    //         channelEdit.edit(embed);
    //     });

    //     collector.on("end", collected => {
    //         return channelEdit.delete();
    //     });

    //     const save = await channelEdit.reactConfirm(message.author.id, 300000);
    //     command.config = save
    //         ? await command.config.save()
    //         : await CommandConfig.findOne({ commandName: command.name });
    //     collector.stop();
    // }

    // public async manageRoles(message, command) {
    //     const { roles } = message.guild;
    //     const serverConfig = command.enabledInGuild(message.guild);

    //     if (!serverConfig) {
    //         return message.channel.sendPopup(
    //             "warn",
    //             "Role restrictions can only be applied to enabled commands",
    //             5000
    //         );
    //     }

    //     const embed = new RichEmbed()
    //         .setTitle(`Role permissions for ${message.client.prefix}${command.name}`)
    //         .setDescription(
    //             stripIndents`Reply with Role names to add or remove their authorisation
    //             Adding any Role authorisation will replace the default Discord permissions check
    //             Removing all roles allows the command to be used by anyone, or reverts it to the default Discord permissions requirements
    //             Click \\✅ when finished to save changes, or \\❌ to cancel
    //             Changes will be automatically cancelled after 5 minutes`
    //         )
    //         .addField("Role / Permissions restrictions", "\u200B");

    //     const evalAuthorisations = () => {
    //         const authorisations = roles.filter(r => command.config.roles.get(r.id));
    //         embed.fields[embed.fields.length - 1].value =
    //             authorisations.array().join(" ") ||
    //             command.config.defaults.permissions.join(" ") ||
    //             "None";
    //     };

    //     evalAuthorisations();

    //     const roleEdit = await message.channel.send(embed);

    //     const collector = roleEdit.channel.createMessageCollector(
    //         m => m.author.id === message.author.id
    //     );

    //     collector.on("collect", message => {
    //         const args = message.content.split(" ");
    //         for (const arg of args) {
    //             const role = message.guild.roles.find(r => r.name === arg);
    //             if (role) {
    //                 command.config.roles.has(role.id)
    //                     ? command.config.roles.delete(role.id)
    //                     : command.config.roles.set(role.id, true);
    //             }
    //         }

    //         message.delete();
    //         evalAuthorisations();
    //         roleEdit.edit(embed);
    //     });

    //     collector.on("end", collected => {
    //         return roleEdit.delete();
    //     });

    //     const save = await roleEdit.reactConfirm(message.author.id, 300000);
    //     command.config = save
    //         ? await command.config.save()
    //         : await CommandConfig.findOne({ commandName: command.name });
    //     collector.stop();
    // }

    // public async reset(message, command) {
    //     command.config.guilds.delete(message.guild.id);
    //     for (const c of message.guild.channels.keyArray()) {
    //         if (command.config.channels.has(c.id)) { command.config.channels.delete(c.id); }
    //     }
    //     for (const r of message.guild.roles.keyArray()) {
    //         if (command.config.roles.has(r.id)) { command.config.roles.delete(r.id); }
    //     }
    //     return command.config.save();
    // }

    public async exec(message: Message, { type, target }: CommandArgs) {
        console.log(type, target instanceof Command ? target.id : target);
        return;
        // Dont provide any config for owner-only commands
        // if (command.ownerOnly) { return; }

        // Ignore config if this message isn't in a guild
        // if (!message.guild) { return; }

        // const commandConfigs = this.client.settings.get(message.guild.id, "commands") as ICommandConfigDocument[];
        // const config = commandConfigs.find(c => c.command === command.id);

        // const info = this.generateCommandInfo(message, command, Object.assign(command.defaults, config));
        // if (!info.footer) { info.setFooter("Click the pencil to edit the configuration"); }

        // const sent = await message.channel.send(info);
        // await sent.react("✏");

        // const filter = (r, u) => r.emoji.name === "✏" && u.id === message.author.id;
        // const edit = await sent.awaitReactions(filter, { time: 30000, max: 1 });
        // await sent.clearReactions();

        // if (!edit.first()) { return; }
        // await sent.edit(this.addEditControls(message, info, command));

        // return this.configure(message, sent, command);
    }

    // /**
    //  * Generate a RichEmbed showin the configuration of commands in this Guild
    //  * @param {Message} message
    //  * @returns {RichEmbed}
    //  */
    // public generateGuildInfo(message) {
    //     const { commands } = message.client;

    //     const enabled = commands.filter(c => c.enabledInGuild(message.guild));
    //     const disabled = commands.filter(c => c.disabledInGuild(message.guild));

    //     const channelOverrides = commands.filter(c => c.hasChannelConfigInGuild(message.guild));
    //     const roleOverrides = commands.filter(c => c.restrictedInGuild(message.guild));

    //     const enabledOutput = enabled.map(c => {
    //         let name = c.name;
    //         name = channelOverrides.has(c.name) ? `[${name}]` : name;
    //         name = roleOverrides.has(c.name) ? `{${name}}` : name;
    //         return `\`${name}\``;
    //     });
    //     const disabledOutput = disabled.map(c => {
    //         let name = c.name;
    //         name = channelOverrides.has(c.name) ? `[${name}]` : name;
    //         return `\`${name}\``;
    //     });

    //     const embed = new RichEmbed()
    //         .setTitle(`Server-level command configuration for ${message.guild.name}`)
    //         .setDescription(
    //             "`[command]` - may be overriden in specific channels\n`{command}` - has additional role/permission restrictions"
    //         )
    //         .addField("Enabled", `${enabledOutput.join(" ")}`)
    //         .addField("Disabled", `${disabledOutput.join(" ")}`)
    //         .setFooter("Use !config <command> to view/edit detailed configuration");

    //     return embed;
    // }

    /**
     * Generates a RichEmbed for the command configuration and returns the reactions required
     * @param {Message} message
     * @param {BaseCommand} command
     * @returns {RichEmbed}
     */
    private generateCommandInfo(message: Message, command: Command, config: ICommandConfigDocument) {
        // const g = config.disabled || command.defaults || true;
        // const embed = new MessageEmbed()
        //     .setTitle(`Configuration settings for ${command.id} in ${message.guild!.name}`)
        //     .addField("Server level", config.server_status ? "Enabled" : "Disabled");
        // if (config.channels && config.channels.length) {
        //     const channels = config.channels
        //         .filter(c => c.channel_status !== config.server_status)
        //         .map(c => message.guild!.channels.get(c.channel_id));
        //     embed.addField("Channel overrides", config.channels.join(" "));
        // }
        // if (config.roles && config.roles.length) {
        //     embed.addField("Role required", config.roles.map(r => message.guild!.roles.get(r.role_id)).join(" "));
        // }

        // return embed;
    }
}
