import { parseArgs } from "node:util";
import { Client, GatewayIntentBits } from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { WebSocketManager } from "@discordjs/ws";
import { deployCommands } from "./deploy.js";
import { loadEvents } from "./handlers/events.js";
import { publishIcons } from "./publish-icons.js";

// Check environment variables
if (!process.env.DISCORD_TOKEN) {
	throw new Error("Please set the DISCORD_TOKEN environment variable first.");
}

// Parse command line arguments
const args = parseArgs({
	options: {
		deploy: {
			type: "boolean",
			short: "d",
		},
		publish: {
			type: "boolean",
			short: "p",
		},
	},
});

// Construct the REST and WS instances
const rest = new REST().setToken(process.env.DISCORD_TOKEN);
const gateway = new WebSocketManager({
	intents:
		GatewayIntentBits.Guilds |
		GatewayIntentBits.GuildMessages |
		GatewayIntentBits.MessageContent |
		GatewayIntentBits.GuildMembers,
	rest,
	token: process.env.DISCORD_TOKEN,
});

// If the arg was set, run a command deployment
if (args.values.deploy) {
	await deployCommands(rest);
}

if (args.values.publish) {
	await publishIcons(rest);
}

// Construct the client instance
const client = new Client({
	rest,
	gateway,
});

// Load and bind event listeners
void loadEvents(client);

void gateway.connect();
