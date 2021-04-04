import { AkairoError, AkairoModule } from "discord-akairo";
import { ApplicationCommandData, CommandInteraction, PermissionResolvable, Snowflake } from "discord.js";

export class InteractionCommand extends AkairoModule {
  public data: ApplicationCommandData;
  public guild: boolean;

  constructor(id: string, options: InteractionCommandOptions) {
    super(id, options);
    this.data = options.data;
    this.guild = options.guild ?? false;
  }

  exec(interaction: CommandInteraction): any | Promise<any> {
    // @ts-ignore
    throw new AkairoError("NOT_IMPLEMENTED", this.constructor.name, "exec");
  }
}

export interface InteractionCommandOptions {
  category?: string;
  clientPermissions?: PermissionResolvable | PermissionResolvable[];
  data: ApplicationCommandData;
  guild?: boolean;
}