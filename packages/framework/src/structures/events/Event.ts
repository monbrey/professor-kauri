import { KauriModule, KauriModuleOptions } from "../KauriModule";

export interface EventData {
  emitter: string;
  name: string;
  type?: string;
}

export abstract class Event extends KauriModule {
  public emitter: string;
  public name: string;
  public type: string;

  public constructor(base: KauriModuleOptions, options: EventData) {
    super(base);

    this.emitter = options.emitter;
    this.name = options.name;
    this.type = options.type ?? "on";
  }

  abstract exec(...args: any[]): Awaited<void>;
}
