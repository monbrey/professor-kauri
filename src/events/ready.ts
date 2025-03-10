// import type { EventData } from "../framework/structures/events/Event";
// import { Event } from "../framework/structures/events/Event";

import type { Client } from "@discordjs/core";
import { GatewayDispatchEvents } from "@discordjs/core";
import type { AsyncEventEmitterListenerForEvent } from "@vladfrangu/async_event_emitter";
import { logger } from "../util/logger.js";

export const name = GatewayDispatchEvents.Ready;
export const execute: AsyncEventEmitterListenerForEvent<Client, typeof name> = async ({ data }) => {
	logger.info({
		event: name,
		message: `Client authenticated as ${data.user.username}, serving ${data.guilds.length} guilds.`,
	});
};
