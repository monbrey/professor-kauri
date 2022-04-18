import { EventBindingType, EventEmitterType } from '../../../typings';
import { Module, ModuleOptions } from '../Module';

export interface EventOptions extends ModuleOptions {
	name: string;
	emitter: EventEmitterType;
	type?: EventBindingType;
}

export abstract class Event extends Module {
	public emitter: EventEmitterType;
	public type: string;

	public constructor(options: EventOptions) {
		super(options.name);

		this.emitter = options.emitter;
		this.type = options.type ?? 'on';
	}

	public abstract runEvent(...args: any[]): Awaited<void>;
}
