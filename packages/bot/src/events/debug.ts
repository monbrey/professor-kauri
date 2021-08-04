import { Event } from "@professor-kauri/framework";
import type { Awaited } from "discord.js";

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
