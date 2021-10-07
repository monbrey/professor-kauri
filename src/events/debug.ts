import { Event } from "../framework/structures/events/Event";
import { Awaited } from "../typings";

export const data = {
	name: "debug",
	emitter: "client",
};

export default class DebugEvent extends Event {
	public exec(debug: unknown): Awaited<void> {
		if (process.env.NODE_ENV === "development") {
			console.debug(debug);
		}
	}
}
