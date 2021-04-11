import { codeBlock } from "common-tags";
import { AkairoHandler, LoadPredicate } from "discord-akairo";
import { Collection, CommandInteraction } from "discord.js";
import { resolve } from "path";
import { argMapper } from "../../util/argMapper";
import { KauriClient } from "../client/KauriClient";
import { KauriInteraction } from "./KauriInteraction";

export class KauriInteractionHandler extends AkairoHandler {
  public modules: Collection<string, KauriInteraction>;

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

  async handle(interaction: CommandInteraction) {
    const command = this.findCommand(interaction.commandName);

    if (!command)
      return interaction.reply(`\`${interaction.commandName}\` is not yet implemented!`, { ephemeral: true });

    // if (command.ownerOnly && interaction.user.id !== "122157285790187530")
    //   return interaction.reply(`\`${interaction.commandName}\` usage is restricted`, { ephemeral: true });

    try {
      const args = argMapper(interaction.options ?? []);
      await command.exec(interaction, args);
    } catch (err) {
      console.error(err);
      interaction.reply(`[${interaction.commandName}] ${err.stack}`, { ephemeral: true, code: true });
    }
  }

  findCommand(name: string): KauriInteraction {
    return this.modules.get(name) as KauriInteraction;
  }

  loadAll(directory = this.directory, filter = this.loadFilter || (() => true)) {
    const filepaths = AkairoHandler.readdirRecursive(directory);
    for (let filepath of filepaths) {
      filepath = resolve(filepath);
      if (filter(filepath)) this.load(filepath);
    }

    const [globals, guilds] = this.modules.partition((m: KauriInteraction) => !m.guild);

    // this.client.application?.commands.set(globals.map(c => c.apiTransform()));

    if (!process.env.KAURI_GUILD)
      console.error("[KauriInteractionHandler]: No guild configured");
    else if (!this.client.guilds.resolve(process.env.KAURI_GUILD))
      console.error("[KauriInteractionHandler]: Unable to resolve configured guild");
    else {
      // this.client.guilds.resolve(process.env.KAURI_GUILD!)?.commands.set(guilds.map(c => c.apiTransform()));
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