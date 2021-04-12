/* eslint-disable camelcase */
import { AkairoError, AkairoModule } from "discord-akairo";
import { ApplicationCommand, ApplicationCommandData, ApplicationCommandOption, ApplicationCommandPermissions, CommandInteraction } from "discord.js";
import { CommandExecutionError } from "../misc/CommandExecutionError";
import { KauriInteractionHandler } from "./KauriInteractionHandler";

export class KauriInteraction extends AkairoModule implements ApplicationCommandData {
  public name: string;
  public description: string;
  public options?: ApplicationCommandOption[];

  public defaultPermission?: boolean;
  public permissions?: ApplicationCommandPermissions[];

  public guild: boolean;
  public handler!: KauriInteractionHandler;

  public command?: ApplicationCommand;

  constructor(data: KauriInteractionOptions) {
    super(data.name, data);
    this.name = data.name;
    this.description = data.description;
    this.defaultPermission = data.defaultPermission ?? true;
    this.options = data.options;
    this.permissions = data.permissions;
    this.guild = data.guild ?? false;
  }

  public exec(interaction: CommandInteraction, args?: Map<string, any>): any | Promise<any> {
    // @ts-ignore
    throw new AkairoError("NOT_IMPLEMENTED", this.constructor.name, "exec");
  }

  public async create() {
    if (!this.client.application)
      throw new CommandExecutionError("[KauriInteraction] Attempting to create commands before application ready");
    if (this.command)
      throw new CommandExecutionError(`[KauriInteraction] Command '${this.name}' already exists`);

    let manager;
    if (this.guild) {
      if (!process.env.KAURI_GUILD)
        return console.error("[KauriInteraction]: No guild configured");

      const guild = this.client.guilds.resolve(process.env.KAURI_GUILD);
      if (!guild)
        return console.error("[KauriInteraction]: Unable to resolve configured guild");

      manager = guild.commands;
    } else {
      manager = this.client.application.commands;
    }

    this.command = await manager.create(KauriInteraction.apiTransform(this));
    return this.command;
  }

  public async edit() {
    this.reload();

    if (!this.client.application)
      throw new CommandExecutionError("[KauriInteraction] Attempting to edit commands before application ready");
    if (!this.command)
      throw new CommandExecutionError(`[KauriInteraction] Command '${this.name}' does not exist, create it first`);

    return this.command.edit(KauriInteraction.apiTransform(this));
  }

  public async delete() {
    if (!this.client.application)
      throw new CommandExecutionError("[KauriInteraction] Attempting to edit commands before application ready");
    if (!this.command)
      throw new CommandExecutionError(`[KauriInteraction] Command '${this.name}' does not exist, create it first`);

    return this.command.delete();
  }


  public async updatePermissions() {
    if (!this.client.application)
      throw new CommandExecutionError("[KauriInteraction] Attempting to edit commands before application ready");
    if (!this.command)
      throw new CommandExecutionError(`[KauriInteraction] Command '${this.name}' does not exist, create it first`);

    return this.command.editPermissions(this.permissions ?? []);
  }

  static apiTransform(interaction: KauriInteraction) {
    return {
      name: interaction.name,
      description: interaction.description,
      default_permission: interaction.defaultPermission,
      options: interaction.options,
    };
  }
}
export interface KauriInteractionOptions extends ApplicationCommandData {
  category?: string;
  defaultPermission?: boolean;
  guild?: boolean;
  permissions?: ApplicationCommandPermissions[];
}
