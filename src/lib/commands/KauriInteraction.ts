/* eslint-disable camelcase */
import { AkairoError, AkairoModule } from "discord-akairo";
import { ApplicationCommandData, ApplicationCommandOption, CommandInteraction, Snowflake } from "discord.js";

export class KauriInteraction extends AkairoModule implements ApplicationCommandData {
  public description: string;
  public defaultPermission: boolean;
  public guild: boolean;
  public name: string;
  public options?: ApplicationCommandOption[];
  public permissions?: KauriInteractionPermissionOptions[];


  constructor(data: KauriInteractionOptions) {
    super(data.name, data);
    this.name = data.name;
    this.description = data.description;
    this.defaultPermission = data.defaultPermission ?? true;
    this.options = data.options;
    this.permissions = data.permissions;
    this.guild = data.guild ?? false;
  }

  public exec(interaction: CommandInteraction, args: Map<string, any>): any | Promise<any> {
    // @ts-ignore
    throw new AkairoError("NOT_IMPLEMENTED", this.constructor.name, "exec");
  }

  public create() {
    if (this.guild) {
      if (!process.env.KAURI_GUILD)
        return console.error("[KauriInteraction]: No guild configured");

      const guild = this.client.guilds.resolve(process.env.KAURI_GUILD);
      if (!guild)
        return console.error("[KauriInteraction]: Unable to resolve configured guild");

      return guild.commands.create(this.apiTransform());
    }

    return this.client.application?.commands.create(this.apiTransform());
  }

  public async edit() {
    if (this.guild) {
      if (!process.env.KAURI_GUILD)
        return console.error("[KauriInteraction]: No guild configured");

      const guild = this.client.guilds.resolve(process.env.KAURI_GUILD);
      if (!guild)
        return console.error("[KauriInteraction]: Unable to resolve configured guild");

      const command = await guild.commands.fetch().then(commands => commands.find(c => c.name === this.name));

      if (!command)
        return console.error("[KauriInteraction]: Command not found");

      const edit = await command.edit(this.apiTransform());
      console.log(edit);
      return;
    }

    // return this.client.application?.commands.resolve(this.name)!.edit(this.apiTransform());
  }

  public async delete() {
    if (this.guild) {
      if (!process.env.KAURI_GUILD)
        return console.error("[KauriInteractionHandler]: No guild configured");

      const guild = this.client.guilds.resolve(process.env.KAURI_GUILD);
      if (!guild)
        return console.error("[KauriInteractionHandler]: Unable to resolve configured guild");

      // eslint-disable-next-line no-shadow
      const command = await guild.commands.fetch().then(commands => commands.find(c => c.name === this.name));

      if (!command)
        return console.error("[KauriInteraction]: Command not found");

      return command.delete();
    }

    const command = await this.client.application?.commands.fetch().then(commands => commands.find(c => c.name === this.name));

    if (!command)
      return console.error("[KauriInteraction]: Command not found");

    return command.delete();
  }

  public updatePermissions() {
    if (this.guild) {
      if (!process.env.KAURI_GUILD)
        return console.error("[KauriInteractionHandler]: No guild configured");

      const guild = this.client.guilds.resolve(process.env.KAURI_GUILD);
      if (!guild)
        return console.error("[KauriInteractionHandler]: Unable to resolve configured guild");

      const command = guild.commands.resolve(this.name);
      // @ts-ignore
      return this.client.api.application(this.client.application.id).guilds(guild.id).commands(command.id).permissions.put({
        permissions: this.permissions
      });
    }

    // @ts-ignore
    return this.client.api.application(this.client.application.id).commands(command.id).permissions.put({
      permissions: this.permissions
    });
  }

  public apiTransform() {
    return {
      name: this.name,
      description: this.description,
      default_permission: this.defaultPermission,
      options: this.options
    };
  }
}

export interface KauriInteractionOptions extends ApplicationCommandData {
  category?: string;
  defaultPermission?: boolean;
  permissions?: KauriInteractionPermissionOptions[];
  guild?: boolean;
}

export interface KauriInteractionPermissionOptions {
  id: Snowflake;
  type: 1 | 2;
  permission: boolean;
}