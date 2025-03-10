import type { Client } from "@discordjs/core";
import { GatewayDispatchEvents, InteractionType } from "@discordjs/core";
import type { AsyncEventEmitterListenerForEvent } from "@vladfrangu/async_event_emitter";
import { isChatInputApplicationCommandInteraction } from "discord-api-types/utils";
import { handleAutocomplete, handleChatInputCommand } from "../handlers/commands.js";

export const name = GatewayDispatchEvents.InteractionCreate;
export const execute: AsyncEventEmitterListenerForEvent<Client, typeof name> = async ({ data, api }) => {
	switch (data.type) {
		case InteractionType.Ping:
			break;
		case InteractionType.ApplicationCommand:
			if (isChatInputApplicationCommandInteraction(data)) {
				await handleChatInputCommand(api, data);
			}

			break;
		case InteractionType.MessageComponent:
			// await Handlers.messageComponentInteraction(api, data);
			break;
		case InteractionType.ApplicationCommandAutocomplete:
			await handleAutocomplete(api, data);
			break;
		case InteractionType.ModalSubmit:
			// await handleModalSubmitInteraction(api, data);
			break;
	}
};
