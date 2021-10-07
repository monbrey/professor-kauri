import { resolve } from "path";
import { Intents } from "discord.js";
import dotenv from "dotenv";
import { KauriClient } from "./framework/KauriClient";

dotenv.config();

const client = new KauriClient({
	commandDirectory: resolve(__dirname, "commands"),
	eventDirectory: resolve(__dirname, "events"),
	allowedMentions: { parse: ["users", "roles"] },
	partials: ["MESSAGE", "CHANNEL", "REACTION", "USER", "GUILD_MEMBER"],
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_BANS,
		Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
		Intents.FLAGS.GUILD_WEBHOOKS,
		Intents.FLAGS.GUILD_INVITES,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.DIRECT_MESSAGES,
	],
	restTimeOffset: 100,
});

client.start();
