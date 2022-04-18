import * as Models from '../framework/models';
import { Module, ModuleOptions } from '../framework/structures/Module';

export type ModelName = keyof typeof Models;
export type ModelInstance = (typeof Models)[ModelName] extends new (...args: any[]) => infer R ? R : never;

export const enum AugmentationType {
	Ability = 'Ability',
	Attack = 'Attack',
	EndOfTurn = 'EOT',
	Item = 'Item',
	Species = 'Species',
	RoleConfig = 'RoleConfig',
	Weather = 'Weather'
}

export const enum EventBindingType {
	On = 'on',
	Once = 'once'
}

export const enum EventEmitterType {
	Client = 'client',
	Websocket = 'websocket'
}
export interface RawModule<T extends Module = Module, U extends ModuleOptions = ModuleOptions> {
	data: Readonly<U>;
	default: new (data: U) => T;
}
