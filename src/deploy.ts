import 'reflect-metadata';
import { resolve } from 'path';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { CommandHandler } from './framework/structures/commands/CommandHandler';

(async () => {
	if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID || !process.env.GUILD_ID) {
		throw new Error('Environment variables required for deployment are missing');
	}

	const commands = await CommandHandler.getDeploymentData(resolve(__dirname, 'commands'));

	const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

	rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
		.then(() => console.log(`Successfully registered ${commands.length} commands`))
		.catch(console.error);
})();


