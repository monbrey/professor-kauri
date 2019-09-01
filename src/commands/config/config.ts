import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { MessageEmbed } from "discord.js";
import { MessageReaction } from "discord.js";
import { User } from "discord.js";
import { Snowflake } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { ICommandConfigDocument } from "../../models/schemas/commandConfig";

interface CommandArgs {
    command: KauriCommand;
}

export default class ConfigCommand extends KauriCommand {
    constructor() {
        super("config", {
            aliases: ["config"],
            category: "Config",
            description: "Change command configuration in this server.",
            channel: "guild",
        });
    }

    public *args() {
        const command = yield {
            type: "commandAlias",
            prompt: {
                start: new MessageEmbed().setColor("GREEN").setTitle("Which command would you like to view config for?")
            }
        };

        return { command };
    }

    public async exec(message: Message, { command }: CommandArgs) {
        if (!message.guild) { return; }

        // Dont provide any config for owner-only commands
        if (command.ownerOnly) { return; }

        const commandConfigs = this.client.settings.get(message.guild.id, "commands") as ICommandConfigDocument[];
        const config = (commandConfigs.find(c => c.command === command.id) || { command: command.id } as ICommandConfigDocument);

        const info = this.generateCommandInfo(message, command, config);

        if (!message.member!.permissions.has("MANAGE_GUILD", true)) {
            return message.util!.send({ embed: info });
        }

        info.setFooter("Click the pencil to edit the configuration");
        const sent = await message.channel.send(info);
        info.setFooter("");
        await sent.react("✏");

        const filter = ({ emoji }: MessageReaction, u: User) => emoji.name === "✏" && u.id === message.author!.id;
        const edit = await sent.awaitReactions(filter, { time: 30000, max: 1 });
        await sent.reactions.removeAll();

        if (!edit.first()) { return; }
        await sent.edit(this.addEditControls(message, info, command, config));

        return this.configure(message, sent, command, config);
    }

    private async reset(message: Message, command: KauriCommand) {
        const configs = this.client.settings.get(message.guild!.id, "commands") as ICommandConfigDocument[];
        const index = configs.findIndex(c => c.command === command.id);

        if (index !== -1) {
            configs.splice(index, 1);
            this.client.settings.set(message.guild!.id, "commands", configs);
        }
    }

    private async manageRoles(message: Message, command: KauriCommand, config: ICommandConfigDocument) {
        const { roles } = message.guild!;
        const gDisabled = config.disabled || command.defaults.disabled || false;

        if (gDisabled) {
            return message.channel.embed("warn", "Role restrictions can only be applied to enabled commands");
        }

        const embed = new MessageEmbed()
            .setTitle(`Role permissions for ${command.id}`)
            .setDescription(`Reply with Role names to add or remove their authorisation
                Adding any Role authorisation will replace the default Discord permissions check
                Removing all roles allows the command to be used by anyone, or reverts it to the default Discord permissions requirements
                Click \\✅ when finished to save changes, or \\❌ to cancel
                Changes will be automatically cancelled after 5 minutes`
            )
            .addField("Role / Permissions restrictions", "\u200B");

        const evalAuthorisations = () => {
            const authorisations = roles.filter(role => {
                const setting = config.roles.find(r => r.role_id === role.id);
                if (!setting) { return false; }
                return setting.disabled !== gDisabled;
            });
            embed.fields[embed.fields.length - 1].value = authorisations.array().join(" ") || "None";
        };

        evalAuthorisations();

        const roleEdit = await message.channel.send(embed);

        const collector = roleEdit.channel.createMessageCollector(
            m => m.author.id === message.author!.id
        );

        collector.on("collect", (m: Message) => {
            const args = message.content.split(" ");
            for (const arg of args) {
                const role = message.guild!.roles.find(r => r.name === arg);
                if (role) {
                    const index = config.roles.findIndex(r => r.role_id === role.id);
                    index !== -1
                        ? config.roles.splice(index, 1)
                        : config.roles.push({ role_id: role.id, disabled: !gDisabled });
                }
            }

            message.delete();
            evalAuthorisations();
            roleEdit.edit(embed);
        });

        collector.on("end", collected => {
            return roleEdit.delete();
        });

        const save = await roleEdit.reactConfirm(message.author!.id, 300000);
        if (save) {
            this.saveConfig(message.guild!.id, command, config);
        }
        collector.stop();
    }

    private async manageChannels(message: Message, command: KauriCommand, config: ICommandConfigDocument) {
        const { channels } = message.guild!;
        const gDisabled = config.disabled || command.defaults.disabled || false;

        const embed = new MessageEmbed()
            .setTitle(`Channel overrides for ${command.id}`)
            .setDescription(`Mention channels to add or remove their override
                Click \\✅ when finished to save changes, or \\❌ to cancel
                Changes will be automatically cancelled after 5 minutes`
            )
            .addField("Server setting", `${gDisabled ? "Disabled" : "Enabled"} `)
            .addField(`Channel ${gDisabled ? "Enabled" : "Disabled"}`, "\u200B");

        const evalOverrides = () => {
            const overrides = channels.filter(
                channel => {
                    const setting = config.channels.find(c => c.channel_id === channel.id);
                    if (!setting) { return false; }
                    return ![undefined, gDisabled].includes(setting.disabled);
                });
            embed.fields[embed.fields.length - 1].value = overrides.array().join(" ") || "None";
        };

        evalOverrides();

        const channelEdit = await message.channel.send(embed);

        const collector = channelEdit.channel.createMessageCollector(
            m => m.author.id === message.author!.id
        );

        collector.on("collect", (m: Message) => {
            for (const id of message.mentions.channels.keyArray()) {
                const index = config.channels.findIndex(c => c.channel_id === id);
                index !== -1
                    ? config.channels.splice(index, 1)
                    : config.channels.push({ channel_id: id, disabled: !gDisabled });
            }
            message.delete();
            evalOverrides();
            channelEdit.edit(embed);
        });

        collector.on("end", collected => {
            return channelEdit.delete();
        });

        const save = await channelEdit.reactConfirm(message.author!.id, 300000);
        if (save) {
           this.saveConfig(message.guild!.id, command, config);
        }

        collector.stop();
    }

    /**
     * Listens to reactions and triggers the command config edit functions
     * @param {Message} message - A Discord.Message object
     * @param {Message} sent
     * @param {KauriCommand} command
     */
    private async configure(message: Message, sent: Message, command: KauriCommand, config: ICommandConfigDocument) {
        const reacts = ["✅", "❌", "🔲", "🚫", "🔄"].filter(e =>
            sent.embeds[0].fields[sent.embeds[0].fields.length - 1].value.includes(e)
        );
        try {
            for (const r of reacts) { await sent.react(r); }
        } catch (e) {
            e.key = "config";
            throw e;
        }

        const filter = ({ emoji }: MessageReaction, u: User) => reacts.includes(emoji.name) && u.id === message.author!.id;
        try {
            const response = await sent.awaitReactions(filter, { time: 30000, max: 1 });
            sent.reactions.removeAll();

            if (!response.first()) { return; }

            await (async () => {
                switch (response.first()!.emoji.name) {
                    case "✅":
                        return this.toggleCommand(message, command, config);
                    case "❌":
                        return this.toggleCommand(message, command, config);
                    case "🔲":
                        return this.manageChannels(message, command, config);
                    case "🚫":
                        return this.manageRoles(message, command, config);
                    case "🔄":
                        return this.reset(message, command);
                }
            })();
        } catch (e) {
            e.key = "config";
            throw e;
        }

        return sent.edit(this.generateCommandInfo(message, command, config));
    }

    private async saveConfig(id: Snowflake, command: KauriCommand, config: ICommandConfigDocument) {
        const configs = this.client.settings.get(id, "commands") as ICommandConfigDocument[];
        const index = configs.findIndex(c => c.command === command.id);
        index === -1 ? configs.push(config) : configs[index] = config;
        return this.client.settings.set(id, "commands", configs);
    }

    private async toggleCommand(message: Message, command: KauriCommand, config: ICommandConfigDocument) {
        config.disabled = !(config.disabled || command.defaults.disabled || false);
        this.saveConfig(message.guild!.id, command, config);
    }

    /**
     * Adds the edit controls to a generated RichEmbed
     * @param {Message} message
     * @param {RichEmbed} info
     * @param {BaseCommand} command
     */
    private addEditControls(message: Message, info: MessageEmbed, command: KauriCommand, config: ICommandConfigDocument) {
        const gDisabled = config.disabled || command.defaults.disabled || false;
        const enableLine = gDisabled ? "\\✅ - Enable this command for the server" : "\\❌ - Disable this command for the server";
        info.addField("Toggles", `
            ${enableLine}
            \\🔲 - Edit Channel overrides for this command
            \\🚫 - Edit Role restrictions for this command
            \\🔄 - Reset all server configuration for this command`);

        return info;
    }

    /**
     * Generates a RichEmbed for the command configuration and returns the reactions required
     * @param {Message} message
     * @param {BaseCommand} command
     * @returns {RichEmbed}
     */
    private generateCommandInfo(message: Message, command: Command, config: ICommandConfigDocument) {
        const gDisabled = config.disabled || command.defaults.disabled || false;

        const embed = new MessageEmbed().setColor("WHITE")
            .setTitle(`Configuration settings for ${command.id} in ${message.guild!.name}`)
            .addField("Server level", gDisabled ? "Disabled" : "Enabled");
        if (config.channels && config.channels.length) {
            const channels = config.channels
                .filter(c => c.disabled !== gDisabled)
                .map(c => message.guild!.channels.get(c.channel_id));
            embed.addField(`Channels ${gDisabled ? "Enabled" : "Disabled"}`, config.channels.join(" "));
        }

        // if (config.roles && config.roles.length) {
        //     embed.addField("Role required", config.roles.map(r => message.guild!.roles.get(r.role_id)).join(" "));
        // }

        return embed;
    }
}
