/* eslint-disable camelcase */
import { AkairoModule } from "discord-akairo";
import { ApplicationCommand, ApplicationCommandData, ApplicationCommandOption, ApplicationCommandPermissions, CommandInteraction } from "discord.js";
import { DefaultPermissions } from "../../util/constants";
import { CommandExecutionError } from "../misc/CommandExecutionError";
import { InteractionHandler } from "./InteractionHandler";

export abstract class KauriInteraction extends AkairoModule implements ApplicationCommandData {
  public name: string;
  public description: string;
  public options?: ApplicationCommandOption[];

  public defaultPermission?: boolean;
  public permissions?: ApplicationCommandPermissions[];

  public guild: boolean;
  public handler!: InteractionHandler;

  public command?: ApplicationCommand;

  constructor(data: KauriInteractionOptions) {
    super(data.name, data);
    this.name = data.name;
    this.description = data.description;
    this.defaultPermission = Boolean(data.defaultPermission);
    this.options = data.options;
    this.guild = data.guild ?? false;

    this.permissions = [...DefaultPermissions, ...(data.permissions || [])];
  }

  abstract exec(interaction: CommandInteraction, args?: Record<string, any>): any | Promise<any>;

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

    this.command = await this.command.edit(this);
    return this.command;
  }

  public async delete() {
    if (!this.client.application)
      throw new CommandExecutionError("[KauriInteraction] Attempting to edit commands before application ready");
    if (!this.command)
      throw new CommandExecutionError(`[KauriInteraction] Command '${this.name}' does not exist, create it first`);

    await this.command.delete();
    delete this.command;
  }


  public async updatePermissions() {
    if (!this.client.application)
      throw new CommandExecutionError("[KauriInteraction] Attempting to edit commands before application ready");
    if (!this.command)
      throw new CommandExecutionError(`[KauriInteraction] Command '${this.name}' does not exist, create it first`);

    return this.command.setPermissions(this.permissions ?? []);
  }

  static apiTransform(interaction: KauriInteraction) {
    return {
      name: interaction.name,
      description: interaction.description,
      defaultPermission: interaction.defaultPermission,
      options: interaction.options,
    };
  }
}
export interface KauriInteractionOptions extends ApplicationCommandData {
  category?: string;
  guild?: boolean;
  permissions?: ApplicationCommandPermissions[];
}
