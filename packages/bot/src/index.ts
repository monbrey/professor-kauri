import { resolve } from "path";
import { KauriClient } from "@professor-kauri/framework";
import dotenv from "dotenv";

dotenv.config();

const client = new KauriClient({
	commandDirectory: resolve(__dirname, "commands"),
	eventDirectory: resolve(__dirname, "events"),
	intents: ["GUILDS", "GUILD_MESSAGES"],
});

client.start();
