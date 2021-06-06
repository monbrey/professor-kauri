import { AkairoHandler, LoadPredicate } from "discord-akairo";
import { Collection, CommandInteraction, CommandInteractionOption, Snowflake } from "discord.js";
import { resolve } from "path";
import { KauriClient } from "../KauriClient";
import { KauriSlashCommand } from "./KauriSlashCommand";

export class InteractionHandler extends AkairoHandler {
  public modules: Collection<string, KauriSlashCommand>;

  public client!: KauriClient;

  constructor(client: KauriClient, {
    directory,
    classToHandle = KauriSlashCommand,
    extensions = [".js", ".ts"],
    automateCategories,
    loadFilter,
  }: InteractionHandlerOptions = {}) {
    super(client, {
      directory,
      classToHandle,
      extensions,
      automateCategories,
      loadFilter
    });

    this.modules = new Collection();
    this.setup();
  }

  setup() {
    this.client.once("ready", async () => {
      await this.fetchAll();

      this.client.on("interaction", async i => {
        if (i.isCommand())
          this.handle(i);
      });
    });
  }

  private argMapper(options: Collection<string, CommandInteractionOption>): Record<string, unknown> {
    const args: Record<string, unknown> = {};
    for (const [key, value] of options) {
      switch (value.type) {
        case "SUB_COMMAND":
        case "SUB_COMMAND_GROUP":
          args["subcommand"] = { name: key, options: value.options ? this.argMapper(value.options) : {} };
          break;
        case "USER":
          args[key] = value.member ?? value.user ?? value.value;
          break;
        case "CHANNEL":
          args[key] = value.channel ?? value.value;
          break;
        case "ROLE":
          args[key] = value.role ?? value.value;
          break;
        default:
          args[key] = value.value ?? (value.type === "BOOLEAN" ? false : null);
      }
    }

    return args;
  }

  async handle(interaction: CommandInteraction) {
    const command = this.findCommand(interaction.commandName);

    if (!command)
      return interaction.reply(`\`${interaction.commandName}\` is not yet implemented!`, { ephemeral: true });

    // if (command.ownerOnly && interaction.user.id !== "122157285790187530")
    //   return interaction.reply(`\`${interaction.commandName}\` usage is restricted`, { ephemeral: true });

    try {
      const args = this.argMapper(interaction.options ?? []);
      await command.exec(interaction, args);
    } catch (err) {
      console.log(err);
      this.client.logger.error(err);
      const method: keyof typeof interaction = interaction.replied ? "reply" : "editReply";
      return interaction[method](`[${interaction.commandName}] ${err.message}`, { ephemeral: true, code: true });
    }
  }

  public findCommand(name: string): KauriSlashCommand {
    return this.modules.get(name) as KauriSlashCommand;
  }

  loadAll(directory = this.directory, filter = this.loadFilter || (() => true)) {
    const filepaths = AkairoHandler.readdirRecursive(directory);
    for (let filepath of filepaths) {
      filepath = resolve(filepath);
      if (filter(filepath)) this.load(filepath);
    }

    return this;
  }

  async fetchAll({ global = true, guild = true } = {}) {
    if (global && this.client.application) {
      const globals = await this.client.application.commands.fetch();
      this.modules.filter(m => !m.guild).forEach(m => {
        const command = globals.find(g => g.name === m.name);
        if (!command) return this.client.logger.warn(`[InteractionHandler] Interaction '${m.name}' has not been pushed to Discord`);
        m.command = command;
        globals.delete(command.id);
      });

      if (globals.size !== 0) this.client.logger.warn(`[InteractionHandler] Unmapped global interactions found: ${globals.map(g => g.name).join(", ")}`);
    }

    if (guild) {
      if (!process.env.KAURI_GUILD)
        return console.error("[KauriInteractionHandler]: No guild configured");

      const kauriGuild = this.client.guilds.resolve(process.env.KAURI_GUILD as Snowflake);
      if (!kauriGuild)
        return console.error("[KauriInteractionHandler]: Unable to resolve configured guild");

      const guilds = await kauriGuild.commands.fetch();
      this.modules.filter(m => m.guild).forEach(m => {
        const command = guilds.find(g => g.name === m.name);
        if (!command) return this.client.logger.warn(`[InteractionHandler] Interaction '${m.name}' has not been pushed to Discord`);
        m.command = command;
        guilds.delete(command.id);
      });

      if (guilds.size !== 0) this.client.logger.warn(`[InteractionHandler] Unmapped guild interactions found: ${guilds.map(g => g.name).join(", ")}`);
    }
  }

  async setAll({ global = true, guild = true } = {}) {
    const [_globals, _guilds] = this.modules.partition((m: KauriSlashCommand) => !m.guild);

    if (global && this.client.application) {
      try {
        const globals = await this.client.application.commands.set(_globals.map(KauriSlashCommand.apiTransform));
        for (const [id, command] of globals) {
          const interaction = _globals.find(g => g.name === command.name);
          if (interaction) interaction.command = command;
        }
      } catch (e) {
        throw e;
      }
    }

    if (guild) {
      if (!process.env.KAURI_GUILD)
        return console.error("[KauriInteractionHandler]: No guild configured");

      const kauriGuild = this.client.guilds.resolve(process.env.KAURI_GUILD as Snowflake);
      if (!kauriGuild)
        return console.error("[KauriInteractionHandler]: Unable to resolve configured guild");

      try {
        const guilds = await kauriGuild.commands.set(_guilds.map(KauriSlashCommand.apiTransform));
        for (const [id, command] of guilds) {
          const interaction = _guilds.find(g => g.name === command.name);
          if (interaction) interaction.command = command;
        }
      } catch (e) {
        throw e;
      }

    }

    return this;
  }

  async setAllPermissions() {
    const guilds = this.modules.filter((m: KauriSlashCommand) => m.guild);

    try {
      await Promise.all(guilds.map(command => command.updatePermissions()));
    } catch (e) {
      throw e;
    }
  }
}

export interface InteractionHandlerOptions {
  automateCategories?: boolean;
  classToHandle?: Function;
  directory?: string;
  extensions?: string[] | Set<string>;
  loadFilter?: LoadPredicate;
}