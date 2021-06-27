import fs from "fs";
import path from "path";
import { Collection } from "discord.js";
import { KauriModule } from "./KauriModule";
import type { KauriClient } from "../client/KauriClient";
import type { Constructor } from "../typings";

export interface KauriHandlerOptions {
  classToLoad?: Function;
  directory: string;
  extensions?: string[];
  loadFilter?: (...args: any) => boolean;
}

/**
 * Module handler heavily inspired by (basically just modified from) Akairo
 * Credit to {@link https://github.com/discord-akairo/discord-akairo}
 */
export abstract class KauriHandler<T extends KauriModule = KauriModule> {
  private classToLoad: Function;
  public client: KauriClient;
  protected directory: any;
  protected extensions: Set<string>;
  protected loadFilter: (...args: any) => boolean;
  public modules: Collection<string, T>;

  constructor(client: KauriClient, options: KauriHandlerOptions) {
    this.classToLoad = options.classToLoad ?? KauriModule;
    this.client = client;
    this.directory = options.directory;
    this.extensions = new Set(options.extensions ?? [".js", ".json", ".ts"]);
    this.loadFilter = options.loadFilter ?? (() => true);
    this.modules = new Collection<string, T>();
  }

  protected register(mod: T): void {
    this.modules.set(mod.name, mod);
  }

  protected deregister(mod: T): void {
    if (mod.filepath) delete require.cache[require.resolve(mod.filepath)];
    this.modules.delete(mod.name);
  }

  public load(mod: string | Constructor<T>): T | void {
    if (typeof mod === "string" && !this.extensions.has(path.extname(mod))) return undefined;

    const _module = typeof mod === "string"
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      ? this.findExport(require(mod))
      : mod;

    if (!_module || !this.isModuleType(_module.prototype)) {
      if (typeof mod === "string") delete require.cache[require.resolve(mod)];
      return undefined;
    }

    const module = new _module(this); // eslint-disable-line new-cap
    if (this.modules.has(module.name)) throw new Error("ALREADY_LOADED");
    this.register(module);
    return module;
  }

  public loadAll(directory = this.directory, filter = this.loadFilter || (() => true)): this {
    const filepaths = KauriHandler.readdirRecursive(directory);
    for (let filepath of filepaths) {
      filepath = path.resolve(filepath);
      if (filter(filepath)) this.load(filepath);
    }

    return this;
  }

  public remove(id: string): T {
    const module = this.modules.get(id.toString());
    if (!module) throw new Error("MODULE_NOT_FOUND");

    this.deregister(module);

    return module;
  }

  public removeAll(): this {
    for (const [name, module] of this.modules) {
      if (module.filepath) this.remove(name);
    }

    return this;
  }

  public reload(id: string): T | void {
    const module = this.modules.get(id);
    if (!module) throw new Error("MODULE_NOT_FOUND");
    if (!module.filepath) throw new Error("NOT_RELOADABLE");

    this.deregister(module);

    const filepath = module.filepath;
    const newMod = this.load(filepath);

    return newMod;
  }

  public reloadAll(): this {
    for (const [name, module] of this.modules) {
      if (module.filepath) this.reload(name);
    }

    return this;
  }

  private findExport(m: any): Constructor<T> | null {
    if (!m) return null;
    if (this.isModuleType(m.prototype)) return m;
    return m.default ? this.findExport(m.default) : null;
  }

  private isModuleType(item: T): boolean {
    return item && (item instanceof this.classToLoad);
  }

  static readdirRecursive(directory: string): string[] {
    const result = [];

    (function read(dir) {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const filepath = path.join(dir, file);

        if (fs.statSync(filepath).isDirectory()) {
          read(filepath);
        } else {
          result.push(filepath);
        }
      }
    }(directory));

    return result;
  }
}
