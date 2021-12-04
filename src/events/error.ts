import { Event } from "../framework/structures/events/Event";
import { Awaited } from "../typings";

export const data = {
	name: "error",
	emitter: "client",
};

export default class ErrorEvent extends Event {
	public exec(error: Error): Awaited<void> {
		this.client.logger.error({ event: "error", message: error.stack });
	}
}
