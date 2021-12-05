import * as Models from "../framework/models";
import { CommandData } from "../framework/structures/commands/Command";

export const enum AugmentationTypes {
	Ability = "Ability",
	Attack = "Attack",
	EOT = "EOT",
	Item = "Item",
	Pokemon = "Pokemon",
	Weather = "Weather",
}

export type Module<T> = {
	default: new (...args: any[]) => T;
	data: CommandData;
};

export type Awaited<T> = T | Promise<T>;
export type Extended<T> = { prototype: any } & T;

export type ModelKey = keyof typeof Models;
export type ModelInstance = (typeof Models)[ModelKey] extends new (...args: any[]) => infer R ? R : never;
