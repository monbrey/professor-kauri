import { API, APIMessageComponentButtonInteraction, APIMessageComponentInteraction, APIMessageComponentSelectMenuInteraction, APIModalSubmitInteraction } from "@discordjs/core";
import { isMessageComponentButtonInteraction, isMessageComponentSelectMenuInteraction } from "discord-api-types/utils";
import { readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

const path = join(dirname(process.argv[1]), "commands");
const files = await readdir(path, { recursive: true }).then((dir) => dir.filter((file) => file.endsWith(".js")));
const commands = new Map<string, {
	onModal(api: API, interaction: APIModalSubmitInteraction): Promise<void>;
}>();

for (const file of files) {
	const { data, onModal } = await import(pathToFileURL(join(path, file)).href);
	if (!data || !onModal) {
		continue;
	}

	commands.set(data.name, {
		onModal,
	});
}

export const handleModalSubmitInteraction = async (api: API, interaction: APIModalSubmitInteraction) => {
	const [command, ] = interaction.data.custom_id.split(":");

	if(commands.has(command)) {
		const { onModal } = commands.get(command)!;
			return await onModal(api, interaction);
	}

}