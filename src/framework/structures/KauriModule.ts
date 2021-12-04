import { KauriClient } from "./KauriClient";
import type { KauriHandler } from "./KauriHandler";

export interface KauriModuleOptions {
	name: string;
	client: KauriClient;
	handler: KauriHandler;
	filepath?: string;
}

export class KauriModule {
	name: string;
	filepath: string | null;
	client: KauriClient;
	handler: KauriHandler;

	constructor(options: KauriModuleOptions) {
		this.name = options.name;
		this.filepath = options.filepath ?? null;
		this.client = options.client;
		this.handler = options.handler;
	}

	reload(): KauriModule | void {
		return this.handler?.reload(this.name);
	}

	remove(): KauriModule | void {
		return this.handler?.remove(this.name);
	}
}
