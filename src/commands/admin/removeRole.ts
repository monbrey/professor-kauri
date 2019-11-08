import { GuildMember, Message, Role } from "discord.js";
import { KauriCommand } from "../../lib/commands/KauriCommand";
import { Roles } from "../../util/constants";
import { stripIndents } from "common-tags";

interface ICommandArgs {
    role: Role;
    member: GuildMember;
}

export default class RemoveRoleCommand extends KauriCommand {
    constructor() {
        super("removeRole", {
            aliases: ["removeRole"],
            category: "Admin",
            description: "Remove roles from URPG members",
            channel: "guild",
        });
    }

    public *args() {
        const role = yield {
            type: "role",
            unordered: true
        };

        const member = yield {
            type: "member",
            unordered: true
        };

        return { role, member };
    }

    private async removeRole(message: Message, role: Role, member: GuildMember) {
        try {
            await member.roles.remove(role);
            return message.util!.embed("success", `${role} removed from ${member}`);
        } catch (e) {
            return message.util!.embed("error", { title: "Error removing role", description: e.message });
        }
    }

    public async exec(message: Message, { role, member }: ICommandArgs) {
        if (!role || !member) return;

        if (member.id === message.author.id) {
            return message.util!.embed("error", "You cannot remove roles from yourself");
        }

        if (message.author.id === this.client.ownerID || message.member?.roles.has(Roles.Head)) return this.removeRole(message, role, member);

        switch (role.id) {
            case Roles.SeniorReferee:
            case Roles.ChiefJudge:
            case Roles.LeadGrader:
            case Roles.ExpertCurator:
            case Roles.EliteRanger:
            case Roles.ElderArbiter:
                if ([Roles.Head, Roles.Staff].some(r => message.member?.roles.has(r)))
                    return this.removeRole(message, role, member);
            case Roles.Referee:
                if ([Roles.Head, Roles.Staff, Roles.SeniorReferee].some(r => message.member?.roles.has(r)))
                    return this.removeRole(message, role, member);
            case Roles.Judge:
                if ([Roles.Head, Roles.Staff, Roles.ChiefJudge].some(r => message.member?.roles.has(r)))
                    return this.removeRole(message, role, member);
            case Roles.Grader:
                if ([Roles.Head, Roles.Staff, Roles.LeadGrader].some(r => message.member?.roles.has(r)))
                    return this.removeRole(message, role, member);
            case Roles.Curator:
                if ([Roles.Head, Roles.Staff, Roles.ExpertCurator].some(r => message.member?.roles.has(r)))
                    return this.removeRole(message, role, member);
            case Roles.Ranger:
                if ([Roles.Head, Roles.Staff, Roles.EliteRanger].some(r => message.member?.roles.has(r)))
                    return this.removeRole(message, role, member);
            case Roles.Arbiter:
                if ([Roles.Head, Roles.Staff, Roles.ElderArbiter].some(r => message.member?.roles.has(r)))
                    return this.removeRole(message, role, member);
            default:
                return message.util!.embed("warn", stripIndents`${role} is not managed by this command.
                If you think it should be, please open an issue on [GitHub](url)`);
        }
    }
}
