import type { ApplicationCommandData, ApplicationCommandOptionData, CommandInteraction, Snowflake } from "discord.js";
import { KauriModule, KauriModuleOptions } from "../KauriModule";

export interface CommandData extends ApplicationCommandData {
  name: string;
  guild?: boolean;
  guilds?: Snowflake[];
}

export abstract class Command extends KauriModule {
  public name: string;
  public description: string;
  public guild: boolean;
  public guilds: Snowflake[];
  public defaultPermission: boolean;
  public options?: ApplicationCommandOptionData[];

  public constructor(base: KauriModuleOptions, options: CommandData) {
    super(base);

    this.name = options.name;
    this.description = options.description;
    this.defaultPermission = options.defaultPermission ?? true;
    this.options = options.options;

    this.guild = options.guild ?? Boolean(options.guilds?.length) ?? false;
    this.guilds = options.guilds ?? [];
  }

  abstract exec(interaction: CommandInteraction): Awaited<void>;
}
