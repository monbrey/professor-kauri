import { stripIndents } from "common-tags";
import { CommandInteraction, GuildMember, MessageEmbed } from "discord.js";
import { Constants, Models } from "../../framework";
import { CommandExecutionError } from "../../framework/errors/CommandExecutionError";
import { ArgumentsOf } from "../../framework/structures/commands/ArgumentsOf";
import { Command } from "../../framework/structures/commands/Command";
import { CommandOptionTypes } from "../../typings";

export const data = {
	name: "role",
	description: "Add or remove a Role from a member",
	options: [
		{
			name: "action",
			description: "Action to take: add | remove",
			type: CommandOptionTypes.String,
			choices: [
				{ name: "add", value: "add" },
				{ name: "remove", value: "remove" },
			],
			required: true,
		},
		{
			name: "member",
			description: "Guild member to action",
			type: CommandOptionTypes.User,
			required: true,
		},
		{
			name: "role",
			description: "Role to add or remove",
			type: CommandOptionTypes.Role,
			required: true,
		},
	],
	defaultPermission: false,
	permissions: [
		{ id: Constants.Role.Approver, type: "ROLE", permission: true },
		{ id: Constants.Role.StaffAlumni, type: "ROLE", permission: true },
		{ id: Constants.Role.MasterTechnician, type: "ROLE", permission: true },
		{ id: Constants.Role.LeadGrader, type: "ROLE", permission: true },
		{ id: Constants.Role.ChiefJudge, type: "ROLE", permission: true },
		{ id: Constants.Role.ElderArbiter, type: "ROLE", permission: true },
		{ id: Constants.Role.EliteRanger, type: "ROLE", permission: true },
		{ id: Constants.Role.ExpertCurator, type: "ROLE", permission: true },
	],
} as const;

export default class RoleCommand extends Command {
	public async exec(
		interaction: CommandInteraction,
		{ action, member, role }: ArgumentsOf<typeof data>
	): Promise<void> {
		if (!action || !member || !role) throw new CommandExecutionError("Command parameters missing");

		if (!member || !(member instanceof GuildMember)) {
			throw new CommandExecutionError("Provided user could not be found in the server");
		}

		const config = await Models.RoleConfig.fetch(this.client, role.id);
		if (!config) {
			throw new CommandExecutionError(
				stripIndents`${role} does not appear to be configured
		    [log an issue](https://github.com/monbrey/professor-kauri-v2/issues) to have this resolved`,
			);
		}

		if (!config.parents?.some(r => member.roles.cache.has(r))) {
			throw new CommandExecutionError(`None of your roles are configured to add/remove ${role}`);
		}

		// this.client.logger.info({
		// 	key: interaction.commandName,
		// 	action,
		// 	member: member.id,
		// 	role: role.id,
		// });

		await (action === "add" ? member.roles.add(role) : member.roles.remove(role));
		const embed = new MessageEmbed()
			.setDescription(`${role} ${action === "add" ? "added to" : "removed from"} ${member}`)
			.setColor(Constants.EmbedColor.SUCCESS);
		return interaction.reply({ embeds: [embed] });
	}
}
