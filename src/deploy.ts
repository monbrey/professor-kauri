import { resolve } from "path";
import dotenv from "dotenv";
import { KauriClient } from "./framework/structures/KauriClient";

dotenv.config();

const client = new KauriClient({
	commandDirectory: resolve(__dirname, "commands"),
	eventDirectory: resolve(__dirname, "events"),
	intents: [],
});

(async () => {
	await client.login();
	await client.commands.deploy();
	console.log("Commands deployed");
	client.destroy();
	process.exit();
})();
