import { resolve } from "path";
import dotenv from "dotenv";
import { KauriClient } from "./framework/KauriClient";

dotenv.config();

const client = new KauriClient({
	commandDirectory: resolve(__dirname, "commands"),
	eventDirectory: resolve(__dirname, "events"),
	intents: ["GUILDS", "GUILD_MESSAGES"],
});

client.start();
