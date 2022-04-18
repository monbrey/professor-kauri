import { container } from 'tsyringe';
import { KauriClient } from '../client/KauriClient';

export interface ModuleOptions {
	name: string;
}

export abstract class Module {
	public name: string;
	public client: KauriClient;

	public constructor(
		name: string
	) {
		this.name = name;
		this.client = container.resolve(KauriClient);
	}

	// public reload(): Module {
	// 	return this.handler.reload(this.name);
	// }

	// public remove(): Module {
	// 	return this.handler.remove(this.name);
	// }
}
