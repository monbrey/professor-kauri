import { Collection } from "discord.js";
import type { EventEmitter } from "node:events";
import type { Event } from "./Event";
import { KauriClient } from "../KauriClient";
import { KauriHandler, KauriHandlerOptions } from "../KauriHandler";

export type KauriEventEmitters = "client" | "websocket";
export class EventHandler extends KauriHandler<Event> {
	public emitters: Collection<KauriEventEmitters, EventEmitter>;

	constructor(client: KauriClient, options: KauriHandlerOptions) {
		super(client, options);

		this.emitters = new Collection<KauriEventEmitters, EventEmitter>();
		this.emitters.set("client", this.client);
		this.emitters.set("websocket", this.client.ws);
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
