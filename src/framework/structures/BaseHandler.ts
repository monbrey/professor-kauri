import { readdirSync, statSync } from 'fs';
import { extname, join, resolve } from 'path';
import { Collection } from 'discord.js';
import { container } from 'tsyringe';
import { Module } from './Module';
import { RawModule } from '../../typings';
import { KauriClient } from '../client/KauriClient';

export interface BaseHandlerOptions {
	classToLoad?: typeof Module;
	directory: string;
	extensions?: string[];
	loadFilter?: (...args: any) => boolean;
}
/**
 * Module handler heavily inspired by (basically just modified from) Akairo
 * Credit to {@link https://github.com/discord-akairo/discord-akairo}
 */
export abstract class BaseHandler<T extends Module = Module> {
	protected client: KauriClient;
	protected classToLoad: typeof Module = Module;
	protected directory = './';
	protected extensions = new Set(['.js', '.json']);
	public modules: Collection<string, T>;

	public constructor(
		client: KauriClient,
		options: BaseHandlerOptions
	) {
		this.client = client;
		if (options.classToLoad) this.classToLoad = options.classToLoad;
		if (options.extensions) this.extensions = new Set(options.extensions);
		this.directory = options.directory;
		this.modules = new Collection<string, T>();
	}

	protected register(module: RawModule): this {
		container.register(module.data.name, {
			useValue: new module.default(module.data)
		});

		return this;
	}

	public load(path: string): this {
		if (!this.extensions.has(extname(path))) {
			this.client.logger.captureEvent({
				message: `Invalid extension - found ${extname(path)}, expected one of ${Array.from(this.extensions).toString()}`
			});
			return this;
		}

		import(path).then((module: RawModule) => {
			this.register(module);
		}).catch(console.error);

		return this;
	}

	public loadAll(directory = this.directory): this {
		const files = BaseHandler.readdirRecursive(directory);
		for (const file of files) {
			this.load(resolve(file));
		}

		return this;
	}

	// public reload(id: string): T | void {

	// }

	// public reloadAll(): this {

	// }

	// public remove(id: string): T {
	// }

	// public removeAll(): this {

	// }

	// private isModuleType(item: T): boolean {
	// 	return item && (item instanceof this.classToLoad);
	// }

	public static async getDeploymentData(directory: string, extensions: Set<string> = new Set(['.js', '.json'])) {
		const files = BaseHandler.readdirRecursive(directory);
		const data = [];
		for (const file of files) {
			if (extensions.has(extname(file))) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				const module: RawModule = await import(file);
				data.push(module.data);
			}
		}

		return data;
	}

	public static readdirRecursive(directory: string): string[] {
		const result: string[] = [];

		const read = (dir: string) => {
			const files = readdirSync(dir);

			for (const file of files) {
				const filepath = join(dir, file);

				if (statSync(filepath).isDirectory()) {
					read(filepath);
				} else {
					result.push(filepath);
				}
			}
		};

		read(directory);

		return result;
	}
}

