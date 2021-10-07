import { Event } from "../framework/structures/events/Event";
import { Awaited } from "../typings";

export const data = {
	name: "error",
	emitter: "client",
};

export default class DebugEvent extends Event {
	public exec(error: Error): Awaited<void> {
		console.error(error.stack);
	}
}
