import { readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import type { API, APIMessageComponentButtonInteraction, APIMessageComponentInteraction, APIMessageComponentSelectMenuInteraction } from "@discordjs/core";
import { isMessageComponentButtonInteraction, isMessageComponentSelectMenuInteraction } from "discord-api-types/utils";

const path = join(dirname(process.argv[1]), "commands");
const files = await readdir(path, { recursive: true }).then((dir) => dir.filter((file) => file.endsWith(".js")));
const commands = new Map<string, {
	onClick?(api: API, interaction: APIMessageComponentButtonInteraction): Promise<void>;
	onSelect?(api: API, interaction: APIMessageComponentSelectMenuInteraction): Promise<void>;
}>();

for (const file of files) {
	const { data, onClick, onSelect } = await import(pathToFileURL(join(path, file)).href);
	if (!data || !onClick && !onSelect) {
		continue;
	}

	commands.set(data.name, {
		onClick,
		onSelect,
	});
}

export const handleMessageComponentInteraction = async (api: API, interaction: APIMessageComponentInteraction) => {
	const [_command] = interaction.data.custom_id.split(":");

	const command = commands.get(_command);
	if (!command) {
		return;
	}

	if (isMessageComponentButtonInteraction(interaction) && command.onClick) {
		await command.onClick(api, interaction as APIMessageComponentButtonInteraction);
	}

	if (isMessageComponentSelectMenuInteraction(interaction) && command.onSelect) {
		await command.onSelect(api, interaction as APIMessageComponentSelectMenuInteraction);
	}
};
