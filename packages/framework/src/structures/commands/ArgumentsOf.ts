import type { Models } from "@professor-kauri/framework";
import type { Channel, GuildMember, Permissions, Role, User } from "discord.js";
import type { CommandOptionTypes, ModelKey } from "../../typings";

type ReadonlyCommand = Readonly<{
	name: string;
	description: string;
	options?: readonly ReadonlyOption[];
}>;

type ReadonlyOption = Readonly<
{
	name: string;
	description: string;
	required?: boolean;
} & (
	| {
		type: CommandOptionTypes.Subcommand | CommandOptionTypes.SubcommandGroup;
		options?: readonly ReadonlyOption[];
	}
	| {
		type: CommandOptionTypes.String;
		choices?: ReadonlyArray<Readonly<{ name: string; value: string }>>;
		augmentTo?: ModelKey;
	}
	| {
		type: CommandOptionTypes.Integer | CommandOptionTypes.Number;
		choices?: ReadonlyArray<Readonly<{ name: string; value: number }>>;
	}
	| {
		type: CommandOptionTypes.Boolean
		| CommandOptionTypes.User
		| CommandOptionTypes.Channel
		| CommandOptionTypes.Role
		| CommandOptionTypes.Mentionable;
	}
)
>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type TypeIdToType<T, O, C, A> = T extends CommandOptionTypes.Subcommand
	? ArgumentsOfRaw<O>
	: T extends CommandOptionTypes.SubcommandGroup
		? ArgumentsOfRaw<O>
		: T extends CommandOptionTypes.String
			? A extends ModelKey
				? (typeof Models)[A] extends new (...args: any[]) => infer R
					? R
					: never
				: C extends ReadonlyArray<{ value: string }>
					? C[number]["value"]
					: string
			: T extends CommandOptionTypes.Integer | CommandOptionTypes.Number
				? C extends ReadonlyArray<{ value: number }>
					? C[number]["value"]
					: number
				: T extends CommandOptionTypes.Boolean
					? boolean
					: T extends CommandOptionTypes.User
						? GuildMember & { user: User; permissions: Permissions }
						: T extends CommandOptionTypes.Channel
							? Channel & { permissions: Permissions }
							: T extends CommandOptionTypes.Role
								? Role
								: never;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type OptionToObject<O> = O extends {
	name: infer K;
	type: infer T;
	required?: infer R;
	augmentTo?: infer A;
	// eslint-disable-next-line @typescript-eslint/no-shadow
	options?: infer O;
	choices?: infer C;
}
	? K extends string
		? R extends true
			? { [k in K]: TypeIdToType<T, O, C, A> }
			: T extends CommandOptionTypes.Subcommand | CommandOptionTypes.SubcommandGroup | CommandOptionTypes.Boolean
				? { [k in K]: TypeIdToType<T, O, C, A> }
				: { [k in K]?: TypeIdToType<T, O, C, A> }
		: never
	: never;

type ArgumentsOfRaw<O> = O extends readonly any[] ? UnionToIntersection<OptionToObject<O[number]>> : never;

export type ArgumentsOf<C extends ReadonlyCommand> = C extends { options: readonly ReadonlyOption[] }
	? UnionToIntersection<OptionToObject<C["options"][number]>>
	: unknown;
