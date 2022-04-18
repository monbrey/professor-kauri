import type { EventEmitter } from 'node:events';
import { Collection } from 'discord.js';
import { container } from 'tsyringe';
import { Event } from './Event';
import { EventEmitterType, RawModule } from '../../../typings';
import { KauriClient } from '../../client/KauriClient';
import { BaseHandler, BaseHandlerOptions } from '../BaseHandler';

export class EventHandler extends BaseHandler<Event> {
	public emitters: Collection<EventEmitterType, EventEmitter>;

	public constructor(client: KauriClient, options: BaseHandlerOptions) {
		super(client, options);

		this.emitters = new Collection<EventEmitterType, EventEmitter>([
			[EventEmitterType.Client, this.client],
			[EventEmitterType.Websocket, this.client.ws]
		]);
	}

	protected register(event: RawModule): this {
		super.register(event);
		this.addToEmitter(event.data.name);

		return this;
	}

	private addToEmitter(name: string): this {
		try {
			const event = container.resolve<Event>(name);

			const emitter = this.emitters.get(event.emitter);
			if (!emitter) throw new Error('EMITTER_NOT_FOUND');

			if (event.type === 'once') {
				emitter.once(event.name, event.runEvent);
				return this;
			}

			emitter.on(event.name, (...args) => {
				this.client.logger.logEvent(event.name);
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				event.runEvent(...args);
			});

			return this;
		} catch (e) {
			this.client.logger.captureException(e);
		}

		return this;
	}

	private removeFromEmitter(name: string): this {
		try {
			const event = container.resolve<Event>(name);

			const emitter = this.emitters.get(event.emitter);
			if (!emitter) throw new Error('EMITTER_NOT_FOUND');

			emitter.removeListener(event.name, event.runEvent);
			return this;
		} catch (e) {
			this.client.logger.captureException(e);
		}

		return this;
	}
}
