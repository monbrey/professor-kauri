import type { KauriClient, KauriHandler, Models } from "@professor-kauri/framework";
import type { ApplicationCommandData, ApplicationCommandOptionData, CommandInteraction } from "discord.js";
import { KauriModule, KauriModuleOptions } from "../KauriModule";

export interface CommandData extends ApplicationCommandData {
  name: string;
  guild?: boolean;
  options?: CommandOptionData[];
}

export type CommandOptions = CommandData & KauriModuleOptions;

export interface CommandOptionData extends ApplicationCommandOptionData {
  augmentTo?: keyof typeof Models;
}

export abstract class Command extends KauriModule {
  public client!: KauriClient;
  public handler!: KauriHandler;

  public name: string;
  public description: string;
  public guild: boolean;
  public defaultPermission: boolean;
  public options: CommandOptionData[];

  public constructor(options: CommandOptions) {
    super(options);

    this.name = options.name;
    this.description = options.description;
    this.defaultPermission = options.defaultPermission ?? true;
    this.options = options.options ?? [];
    this.guild = options.guild ?? false;
  }

  reload(): void | KauriModule {
    throw new Error("Method not implemented.");
  }
  remove(): void | KauriModule {
    throw new Error("Method not implemented.");
  }

  abstract exec(interaction: CommandInteraction, args?: unknown): Awaited<void>;
}
