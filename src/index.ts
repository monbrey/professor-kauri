import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/node';
import { ApplicationCommandOptionType, IntentsBitField, Partials } from 'discord.js';
import 'reflect-metadata';
import { container } from 'tsyringe';
import { KauriClient } from './framework/client/KauriClient';

container.register<PrismaClient>('PrismaClient', {
	useValue: new PrismaClient()
});

container.register<typeof Sentry>('Sentry', {
	useValue: Sentry
});

container.registerInstance('KauriClientOptions', {
	allowedMentions: { parse: ['users', 'roles'] },
	partials: [
		Partials.Message,
		Partials.Channel,
		Partials.Reaction,
		Partials.User,
		Partials.GuildMember,
		Partials.ThreadMember
	],
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.GuildBans,
		IntentsBitField.Flags.GuildEmojisAndStickers,
		IntentsBitField.Flags.GuildWebhooks,
		IntentsBitField.Flags.GuildInvites,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.GuildMessageReactions,
		IntentsBitField.Flags.DirectMessages
		// IntentsBitField.Flags.MessageContent
	],
	commandDirectory: resolve(__dirname, 'commands')
});

const client = container.resolve(KauriClient);

client.on('ready', async () => {
	const guild = client.guilds.cache.get('412130302958239745');
	if (!guild) return;

	await guild.commands.create({
		name: 'ping',
		description: 'Check the bots API and websocket latency',
		options: [{
			name: 'type',
			description: 'Type of ping to check',
			type: ApplicationCommandOptionType.String,
			required: true
		}]
	});
});

client.login(process.env.DISCORD_TOKEN).catch(console.error);
