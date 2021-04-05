import { AkairoError, AkairoModule } from "discord-akairo";
import { ApplicationCommandData, ApplicationCommandOption, CommandInteraction, PermissionResolvable } from "discord.js";
import { threadId } from "node:worker_threads";

export class InteractionCommand extends AkairoModule implements ApplicationCommandData {
  public name: string;
  public guild: boolean;
  public description: string;
  public options?: ApplicationCommandOption[] | undefined;

  constructor(id: string, data: InteractionCommandOptions) {
    super(id, data);
    this.name = data.name;
    this.description = data.description;
    this.options = data.options;
    this.guild = data.guild ?? false;
  }

  exec(interaction: CommandInteraction): any | Promise<any> {
    // @ts-ignore
    throw new AkairoError("NOT_IMPLEMENTED", this.constructor.name, "exec");
  }

  public apiTransform() {
    return {
      name: this.name,
      description: this.description,
      options: this.options
    };
  }
}

export interface InteractionCommandOptions extends ApplicationCommandData {
  category?: string;
  clientPermissions?: PermissionResolvable | PermissionResolvable[];
  guild?: boolean;
}