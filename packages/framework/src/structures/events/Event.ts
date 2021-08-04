import type { Awaited } from "discord.js";
import { KauriModule, KauriModuleOptions } from "../KauriModule";

export interface EventData {
	name: string;
	emitter: string;
	type?: string;
}

export type EventOptions = EventData & KauriModuleOptions;

export abstract class Event extends KauriModule {
	public emitter: string;
	public type: string;

	public constructor(options: EventOptions) {
		super(options);

		this.emitter = options.emitter;
		this.type = options.type ?? "on";
	}

	abstract exec(...args: any[]): Awaited<void>;
}
