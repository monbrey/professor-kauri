import type { Channel, GuildMember, Permissions, Role, User } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { Models } from "../..";
import { ModelKey } from "../../../typings";

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
		type: ApplicationCommandOptionTypes.SUB_COMMAND | ApplicationCommandOptionTypes.SUB_COMMAND_GROUP;
		options?: readonly ReadonlyOption[];
	}
	| {
		type: ApplicationCommandOptionTypes.STRING;
		choices?: ReadonlyArray<Readonly<{ name: string; value: string }>>;
		augmentTo?: ModelKey;
	}
	| {
		type: ApplicationCommandOptionTypes.INTEGER | ApplicationCommandOptionTypes.NUMBER;
		choices?: ReadonlyArray<Readonly<{ name: string; value: number }>>;
	}
	| {
		type: ApplicationCommandOptionTypes.BOOLEAN
		| ApplicationCommandOptionTypes.USER
		| ApplicationCommandOptionTypes.CHANNEL
		| ApplicationCommandOptionTypes.ROLE
		| ApplicationCommandOptionTypes.MENTIONABLE;
	}
)
>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type TypeIdToType<T, O, C, A> = T extends ApplicationCommandOptionTypes.SUB_COMMAND
	? ArgumentsOfRaw<O>
	: T extends ApplicationCommandOptionTypes.SUB_COMMAND_GROUP
		? ArgumentsOfRaw<O>
		: T extends ApplicationCommandOptionTypes.STRING
			? A extends ModelKey
				? (typeof Models)[A] extends new (...args: any[]) => infer R
					? R
					: never
				: C extends ReadonlyArray<{ value: string }>
					? C[number]["value"]
					: string
			: T extends ApplicationCommandOptionTypes.INTEGER | ApplicationCommandOptionTypes.NUMBER
				? C extends ReadonlyArray<{ value: number }>
					? C[number]["value"]
					: number
				: T extends ApplicationCommandOptionTypes.BOOLEAN
					? boolean
					: T extends ApplicationCommandOptionTypes.USER
						? GuildMember & { user: User; permissions: Permissions }
						: T extends ApplicationCommandOptionTypes.CHANNEL
							? Channel & { permissions: Permissions }
							: T extends ApplicationCommandOptionTypes.ROLE
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
			: T extends ApplicationCommandOptionTypes.SUB_COMMAND
			| ApplicationCommandOptionTypes.SUB_COMMAND_GROUP
			| ApplicationCommandOptionTypes.BOOLEAN
				? { [k in K]: TypeIdToType<T, O, C, A> }
				: { [k in K]?: TypeIdToType<T, O, C, A> }
		: never
	: never;

type ArgumentsOfRaw<O> = O extends readonly any[] ? UnionToIntersection<OptionToObject<O[number]>> : never;

export type ArgumentsOf<C extends ReadonlyCommand> = C extends { options: readonly ReadonlyOption[] }
	? UnionToIntersection<OptionToObject<C["options"][number]>>
	: unknown;
