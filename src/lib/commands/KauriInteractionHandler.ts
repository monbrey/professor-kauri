import { AkairoHandler, LoadPredicate } from "discord-akairo";
import { Collection, CommandInteraction, CommandInteractionOption } from "discord.js";
import { S_IFBLK } from "node:constants";
import { isRegExp } from "node:util";
import { resolve } from "path";
import { KauriClient } from "../client/KauriClient";
import { KauriInteraction } from "./KauriInteraction";

export class KauriInteractionHandler extends AkairoHandler {
  public modules: Collection<string, KauriInteraction>;

  public client!: KauriClient;

  constructor(client: KauriClient, {
    directory,
    classToHandle = KauriInteraction,
    extensions = [".js", ".ts"],
    automateCategories,
    loadFilter,
  }: KauriInteractionHandlerOptions = {}) {
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
    this.client.once("ready", () => {
      this.client.on("interaction", async i => {
        if (i.isCommand())
          this.handle(i);
      });
    });
  }

  private argMapper(options: CommandInteractionOption[]): Record<string, any> {
    const args: Record<string, any> = {};
    for (const o of options) {
      switch (o.type) {
        case "SUB_COMMAND":
        case "SUB_COMMAND_GROUP":
          args["subcommand"] = { name: o.name, options: o.options ? this.argMapper(o.options) : null };
          break;
        case "USER":
          args[o.name] = o.member ?? o.user ?? o.value;
          break;
        case "CHANNEL":
          args[o.name] = o.channel ?? o.value;
          break;
        case "ROLE":
          args[o.name] = o.role ?? o.value;
          break;
        default:
          args[o.name] = o.value ?? (o.type === "BOOLEAN" ? false : null);
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
      this.client.logger.parseError(err);
      return interaction.reply(`[${interaction.commandName}] ${err.message}`, { ephemeral: true, code: true });
    }
  }

  public findCommand(name: string): KauriInteraction {
    return this.modules.get(name) as KauriInteraction;
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

      const kauriGuild = this.client.guilds.resolve(process.env.KAURI_GUILD);
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
    const [_globals, _guilds] = this.modules.partition((m: KauriInteraction) => !m.guild);

    if (global && this.client.application) {
      const globals = await this.client.application.commands.set(_globals.map(KauriInteraction.apiTransform));
      for (const [id, command] of globals) {
        const interaction = _globals.find(g => g.name === command.name);
        if (interaction) interaction.command = command;
      }
    }

    if (guild) {
      if (!process.env.KAURI_GUILD)
        return console.error("[KauriInteractionHandler]: No guild configured");

      const kauriGuild = this.client.guilds.resolve(process.env.KAURI_GUILD);
      if (!kauriGuild)
        return console.error("[KauriInteractionHandler]: Unable to resolve configured guild");

      const guilds = await kauriGuild.commands.set(_guilds.map(KauriInteraction.apiTransform));
      for (const [id, command] of guilds) {
        const interaction = _guilds.find(g => g.name === command.name);
        if (interaction) interaction.command = command;
      }
    }

    return this;
  }
}

export interface KauriInteractionHandlerOptions {
  automateCategories?: boolean;
  classToHandle?: Function;
  directory?: string;
  extensions?: string[] | Set<string>;
  loadFilter?: LoadPredicate;
}