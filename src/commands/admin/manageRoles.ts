import { stripIndents } from "common-tags";
import { Argument } from "discord-akairo";
import { GuildMember, Message, Role } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { IRoleConfig, RoleConfig } from "../../models/mongo/roleConfig";

interface ICommandArgs {
  config: IRoleConfig;
  member: GuildMember;
}

export default class AddRoleCommand extends KauriCommand {
  constructor() {
    super("Manage Roles", {
      aliases: ["role", "addRole", "removeRole"],
      category: "Admin",
      channel: "guild",
      clientPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "MANAGE_ROLES"],
      description: "Grants roles to URPG members.\nIf no member argument is provided, the command can be used to self-assign roles where allowed.",
      requiresDatabase: true,
      usage: ["role <role>", "addRole <role> [member]"],

    });
  }

  public *args(): any {
    const config = yield {
      type: Argument.compose("role", "roleConfig"),
      unordered: true
    };

    console.log(config);

    const member = yield {
      type: "member",
      unordered: true
    };

    return { config, member };
  }

  public async help(message: Message) {
    const embed = await super.help(message);

    const self = await RoleConfig.find({ self: true });

    embed.addField("**Self-assignable Roles**", self.map(r => `<@&${r.role_id}>`).join(" "));

    return embed;
  }

  private async addRole(message: Message, role: Role, member: GuildMember) {
    try {
      await member.roles.add(role);
      return message.util!.embed("success", `${role} added to ${member}`);
    } catch (e) {
      return message.util!.embed("error", { title: "Error adding role", description: e.message });
    }
  }

  private async removeRole(message: Message, role: Role, member: GuildMember) {
    try {
      await member.roles.remove(role);
      return message.util!.embed("success", `${role} removed from ${member}`);
    } catch (e) {
      return message.util!.embed("error", { title: "Error removing role", description: e.message });
    }
  }

  public async exec(message: Message, { config, member }: ICommandArgs) {
    const alias = message.util?.parsed?.alias;

    if (!alias) return;
    if (!config) return message.util!.embed("warn", stripIndents`No configuration for that role was found.
            If you think this is an error, please open an issue on [GitHub](https://github.com/Monbrey/professor-kauri-v2)`);

    const role = message.guild?.roles.cache.get(config.role_id);
    if (!role) return message.util!.embed("warn", stripIndents`That role is no longer present in the server`);

    const roleFunc = (() => {
      switch (alias) {
        case "addRole": return this.addRole;
        case "removeRole": return this.removeRole;
        case "role": return (member ? member.roles.cache.has(role.id) : message.member?.roles.cache.has(role.id)) ? this.removeRole : this.addRole;
        default: return;
      }
    })();

    if (typeof roleFunc !== "function") return;

    if (!member) {
      if (!config.self) return;
      return roleFunc(message, role, message.member!);
    }

    if (message.author.id === this.client.ownerID || config.parents?.some(p => message.member?.roles.cache.has(p)))
      return roleFunc(message, role, member);

    return message.util!.embed("warn", stripIndents`Your roles do not grant permission to manage ${role}.
            If you think this is an error, please open an issue on [GitHub](url)`);
  }
}
