import { readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import type { Client } from "@discordjs/core";

export const loadEvents = async (client: Client) => {
	const events = await readdir(join(dirname(process.argv[1]), "events")).then((dir) => dir.filter((file) => file.endsWith(".js")));
	for (const event of events) {
		const { name, execute } = await import(pathToFileURL(join(dirname(process.argv[1]), "events", event)).href);
		if (!name || !execute) {
			continue;
		}

		client.on(name, execute);
	}
};
