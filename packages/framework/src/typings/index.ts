import type { Models } from "..";
import type { CommandData } from "../structures/commands/Command";

export const enum AugmentationTypes {
	Ability = "Ability",
	Attack = "Attack",
	EOT = "EOT",
	Item = "Item",
	Pokemon = "Pokemon",
}

export const enum CommandOptionTypes {
	Subcommand = "SUB_COMMAND",
	SubcommandGroup = "SUB_COMMAND_GROUP",
	String = "STRING",
	Integer = "INTEGER",
	Boolean = "BOOLEAN",
	User = "USER",
	Channel = "CHANNEL",
	Role = "ROLE",
	Mentionable = "MENTIONABLE",
	Number = "NUMBER"
}

export type Module<T> = {
	default: new (...args: any[]) => T;
	data: CommandData;
};

export type Extended<T> = { prototype: any } & T;

export type ModelKey = keyof typeof Models;
export type ModelInstance = (typeof Models)[ModelKey] extends new (...args: any[]) => infer R ? R : never;
