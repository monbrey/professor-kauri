import type { EventEmitter } from "events";
import { Collection } from "discord.js";
import type { Event } from "./Event";
import type { KauriClient } from "../../client/KauriClient";
import { KauriHandler, KauriHandlerOptions } from "../KauriHandler";

export class EventHandler extends KauriHandler<Event> {
  public emitters: Collection<String, EventEmitter>;

  constructor(client: KauriClient, options: KauriHandlerOptions) {
    super(client, options);

    this.emitters = new Collection<string, EventEmitter>();
    this.emitters.set("client", this.client);
  }

  protected register(event: Event): Event {
    super.register(event);
    event.exec = event.exec.bind(event);
    this.addToEmitter(event.name);
    return event;
  }

  protected deregister(event: Event): void {
    this.removeFromEmitter(event.name);
    super.deregister(event);
  }

  public setEmitters(emitters: { [key: string]: EventEmitter }): this {
    for (const [key, value] of Object.entries(emitters)) {
      if (!EventHandler.isEventEmitter(value)) throw new Error("INVALID_TYPE");
      this.emitters.set(key, value);
    }

    return this;
  }

  private addToEmitter(name: string): Event {
    const event = this.modules.get(name);
    if (!event) throw new Error("MODULE_NOT_FOUND");

    const emitter = EventHandler.isEventEmitter(event.emitter) ? event.emitter : this.emitters.get(event.emitter);
    if (!EventHandler.isEventEmitter(emitter)) throw new Error("INVALID_TYPE");

    if (event.type === "once") {
      emitter.once(event.name, event.exec);
      return event;
    }

    emitter.on(event.name, event.exec);
    return event;
  }

  private removeFromEmitter(name: string): Event {
    const event = this.modules.get(name);
    if (!event) throw new Error("MODULE_NOT_FOUND");

    const emitter = EventHandler.isEventEmitter(event.emitter) ? event.emitter : this.emitters.get(event.emitter);
    if (!EventHandler.isEventEmitter(emitter)) throw new Error("INVALID_TYPE");

    emitter.removeListener(event.name, event.exec);
    return event;
  }

  static isEventEmitter(value: unknown): value is EventEmitter {
    const _value = value as EventEmitter;
    return _value !== null
      && _value !== undefined
      && typeof _value.on === "function"
      && typeof _value.emit === "function";
  }
}
