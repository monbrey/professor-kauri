import { PrismaClient } from '@prisma/client';
import { Client, ClientOptions } from 'discord.js';
import { inject, singleton } from 'tsyringe';
import { Logger } from './Logger';
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
		@inject('Logger') public logger: Logger,
		@inject('KauriClientOptions') options: KauriClientOptions
	) {
		super(options);

		this.commandHandler = new CommandHandler(this, {
			classToLoad: Module,
			directory: options.commandDirectory
		}).setup().loadAll();
	}
}
