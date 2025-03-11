import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { Routes } from "@discordjs/core";
import type { REST } from "@discordjs/rest";

export const publishIcons = async (rest: REST) => {
	if (!process.env.CLIENT_ID) {
		throw new Error("Please set the CLIENT_ID environment variable first.");
	}

	const icons = [];
	const files = await readdir(join(dirname(process.argv[1]), "..", "assets", "icons"));

	console.log(files);

	for (const file of files) {
		const path = pathToFileURL(join(dirname(process.argv[1]), "..", "assets", "icons", file));
		await rest.post(Routes.applicationEmojis(process.env.CLIENT_ID), {
			body: {
				name: file.replace(".png", "").replaceAll("-", "").padStart(3, "0"),
				image: `data:image/png;base64,${await readFile(join(dirname(process.argv[1]), "..", "assets", "icons", file), "base64")}`,
			},
		});
	}
};
