import { readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import type { API, APIApplicationCommandAutocompleteInteraction } from "@discordjs/core";
import { MessageFlags, type APIChatInputApplicationCommandInteraction } from "discord-api-types/v10";

const path = join(dirname(process.argv[1]), "commands");
const files = await readdir(path, { recursive: true }).then((dir) => dir.filter((file) => file.endsWith(".js")));
const commands = new Map<string, {
	autocomplete?(api: API, interaction: APIApplicationCommandAutocompleteInteraction): Promise<void>;
	execute(api: API, interaction: APIChatInputApplicationCommandInteraction): Promise<void>;
}>();

for (const file of files) {
	const { data, execute, autocomplete } = await import(pathToFileURL(join(path, file)).href);
	if (!data || !execute) {
		continue;
	}

	commands.set(data.name, {
		autocomplete,
		execute,
	});
}

export const handleChatInputCommand = async (api: API, interaction: APIChatInputApplicationCommandInteraction) => {
	const command = commands.get(interaction.data.name);
	if (!command) {
		await api.interactions.reply(
			interaction.id,
			interaction.token,
			{
				content: `No command \`${interaction.data.name}\` was found. It may have been removed, or temporarily disabled. If you believe this is incorrect, contact monbrey.`,
				flags: MessageFlags.Ephemeral,
			},
		);
		return;
	}

	try {
		await command.execute(api, interaction);
	} catch (error) {
		console.error(error);
	}
};

export const handleAutocomplete = async (api: API, interaction: APIApplicationCommandAutocompleteInteraction) => {
	const command = commands.get(interaction.data.name);
	if (!command?.autocomplete) {
		await api.interactions.reply(
			interaction.id,
			interaction.token,
			{
				content: `No command \`${interaction.data.name}\` was found. It may have been removed, or temporarily disabled. If you believe this is incorrect, contact monbrey.`,
				flags: MessageFlags.Ephemeral,
			},
		);
		return;
	}

	try {
		await command.autocomplete(api, interaction);
	} catch (error) {
		console.error(error);
	}
};

