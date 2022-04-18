import type { ApplicationCommandOptionType, Channel, GuildMember, Role, User } from 'discord.js';
import { ModelName } from '../../../typings';
import * as Models from '../../models';

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
		type: ApplicationCommandOptionType.Subcommand | ApplicationCommandOptionType.SubcommandGroup;
		options?: readonly ReadonlyOption[];
	}
	| {
		type: ApplicationCommandOptionType.String;
		choices?: ReadonlyArray<Readonly<{ name: string; value: string }>>;
		// augmentTo?: ModelKey;
	}
	| {
		type: ApplicationCommandOptionType.Integer | ApplicationCommandOptionType.Number;
		choices?: ReadonlyArray<Readonly<{ name: string; value: number }>>;
	}
	| {
		type: ApplicationCommandOptionType.Boolean
		| ApplicationCommandOptionType.User
		| ApplicationCommandOptionType.Channel
		| ApplicationCommandOptionType.Role
		| ApplicationCommandOptionType.Mentionable;
	}
)
>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type TypeIdToType<T, O, C, A> = T extends ApplicationCommandOptionType.Subcommand
	? ArgumentsOfRaw<O>
	: T extends ApplicationCommandOptionType.SubcommandGroup
		? ArgumentsOfRaw<O>
		: T extends ApplicationCommandOptionType.String
			? A extends ModelName
				? (typeof Models)[A] extends new (...args: any[]) => infer R
					? R
					: never
				: C extends ReadonlyArray<{ value: string }>
					? C[number]['value']
					: string
			: T extends ApplicationCommandOptionType.Integer | ApplicationCommandOptionType.Number
				? C extends ReadonlyArray<{ value: number }>
					? C[number]['value']
					: number
				: T extends ApplicationCommandOptionType.Boolean
					? boolean
					: T extends ApplicationCommandOptionType.User
						? GuildMember & { user: User; permissions: Permissions }
						: T extends ApplicationCommandOptionType.Channel
							? Channel & { permissions: Permissions }
							: T extends ApplicationCommandOptionType.Role
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
			: T extends ApplicationCommandOptionType.Subcommand
			| ApplicationCommandOptionType.SubcommandGroup
			| ApplicationCommandOptionType.Boolean
				? { [k in K]: TypeIdToType<T, O, C, A> }
				: { [k in K]?: TypeIdToType<T, O, C, A> }
		: never
	: never;

type ArgumentsOfRaw<O> = O extends readonly any[] ? UnionToIntersection<OptionToObject<O[number]>> : never;

export type ArgumentsOf<C extends ReadonlyCommand> = C extends { options: readonly ReadonlyOption[] }
	? UnionToIntersection<OptionToObject<C['options'][number]>>
	: unknown;
