/* eslint-disable camelcase */
import { AkairoModule } from 'discord-akairo';
import {
  ApplicationCommand,
  ApplicationCommandData,
  ApplicationCommandOptionData,
  ApplicationCommandPermissions,
  CommandInteraction,
  Snowflake,
} from 'discord.js';
import { InteractionHandler } from './InteractionHandler';
import { DefaultPermissions } from '../../util/constants';
import { CommandExecutionError } from '../misc/CommandExecutionError';

export abstract class KauriSlashCommand extends AkairoModule implements ApplicationCommandData {
  public name: string;
  public description: string;
  public options?: ApplicationCommandOptionData[];

  public defaultPermission?: boolean;
  public permissions?: ApplicationCommandPermissions[];

  public guild: boolean;
  public handler!: InteractionHandler;

  public command?: ApplicationCommand;

  constructor(data: KauriInteractionOptions) {
    super(data.name, data);
    this.name = data.name;
    this.description = data.description;
    this.defaultPermission = data.defaultPermission ?? true;
    this.options = data.options;
    this.guild = data.guild ?? false;

    this.permissions = [...DefaultPermissions, ...(data.permissions || [])];
  }

  abstract exec(interaction: CommandInteraction, args?: Record<string, any>): any | Promise<any>;

  public async create(): Promise<ApplicationCommand> {
    if (!this.client.application) {
      throw new CommandExecutionError('[KauriInteraction] Attempting to create commands before application ready');
    }
    if (this.command) {
      throw new CommandExecutionError(`[KauriInteraction] Command '${this.name}' already exists`);
    }

    let manager;
    if (this.guild) {
      if (!process.env.KAURI_GUILD) {
        throw new CommandExecutionError('[KauriInteraction]: No guild configured');
      }

      const guild = this.client.guilds.resolve(process.env.KAURI_GUILD as Snowflake);
      if (!guild) throw new CommandExecutionError('[KauriInteraction]: Unable to resolve configured guild');

      manager = guild.commands;
    } else {
      manager = this.client.application.commands;
    }

    this.command = await manager.create(this);
    return this.command;
  }

  public async edit(): Promise<ApplicationCommand> {
    this.reload();

    if (!this.client.application) {
      throw new CommandExecutionError('[KauriInteraction] Attempting to edit commands before application ready');
    }
    if (!this.command) {
      throw new CommandExecutionError(`[KauriInteraction] Command '${this.name}' does not exist, create it first`);
    }

    this.command = await this.command.edit(this);
    return this.command;
  }

  public async delete(): Promise<void> {
    if (!this.client.application) {
      throw new CommandExecutionError('[KauriInteraction] Attempting to edit commands before application ready');
    }
    if (!this.command) {
      throw new CommandExecutionError(`[KauriInteraction] Command '${this.name}' does not exist, create it first`);
    }

    await this.command.delete();
    delete this.command;
  }

  public updatePermissions(): Promise<ApplicationCommandPermissions[]> {
    if (!this.client.application) {
      throw new CommandExecutionError('[KauriInteraction] Attempting to edit commands before application ready');
    }
    if (!this.command) {
      throw new CommandExecutionError(`[KauriInteraction] Command '${this.name}' does not exist, create it first`);
    }

    return this.command.permissions.set({ permissions: this.permissions ?? [] });
  }
}

export interface KauriInteractionOptions extends ApplicationCommandData {
  category?: string;
  guild?: boolean;
  permissions?: ApplicationCommandPermissions[];
}
