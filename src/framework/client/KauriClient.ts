import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/node';
import { Client, ClientOptions } from 'discord.js';
import { inject, singleton } from 'tsyringe';
import { Module } from '../structures/Module';
import { CommandHandler } from '../structures/commands/CommandHandler';

export interface KauriClientOptions extends ClientOptions {
	commandDirectory: string;
	eventDirectory: string;
}

@singleton()
export class KauriClient extends Client {
	public commandHandler: CommandHandler;

	public constructor(
		@inject('PrismaClient') public database: PrismaClient,
		@inject('Sentry') public logger: typeof Sentry,
		@inject('KauriClientOptions') options: KauriClientOptions
	) {
		super(options);

		this.commandHandler = new CommandHandler(this, {
			classToLoad: Module,
			directory: options.commandDirectory
		}).setup().loadAll();
	}
}
