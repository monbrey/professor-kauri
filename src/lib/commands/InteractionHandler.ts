import { codeBlock } from "common-tags";
import { AkairoHandler, LoadPredicate } from "discord-akairo";
import { Collection, CommandInteraction } from "discord.js";
import { resolve } from "path";
import { KauriClient } from "../client/KauriClient";
import { InteractionCommand } from "./InteractionCommand";

export class InteractionHandler extends AkairoHandler {
  public modules: Collection<string, InteractionCommand>;

  constructor(client: KauriClient, {
    directory,
    classToHandle = InteractionCommand,
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
    this.client.once("ready", () => {
      this.client.on("interaction", async i => {
        if (i.isCommand())
          this.handle(i);
      });
    });
  }

  async handle(interaction: CommandInteraction) {
    const command = this.findCommand(interaction.commandName);

    if (!command) interaction.reply(`\`${interaction.commandName}\`is not yet implemented!`, { ephemeral: true });

    try {
      await command.exec(interaction);
    } catch (err) {
      console.error(err);
      interaction.reply(`An error occurred while running \`${interaction.commandName}\`:\n\t${err.message}`).catch(e => {
        if (err.code === 10062) interaction.editReply(`An error occurred while running \`${interaction.commandName}\`:\n\t${err.message}`);
      });
    }
  }

  findCommand(name: string): InteractionCommand {
    return this.modules.get(name) as InteractionCommand;
  }

  loadAll(directory = this.directory, filter = this.loadFilter || (() => true)) {
    const filepaths = AkairoHandler.readdirRecursive(directory);
    for (let filepath of filepaths) {
      filepath = resolve(filepath);
      if (filter(filepath)) this.load(filepath);
    }

    const [global, guild] = this.modules.partition((m: InteractionCommand) => !m.guild);

    this.client.application?.commands.set(global.map(c => c.data));
    this.client.guilds.resolve(process.env.KAURI_GUILD!)?.commands.set(guild.map(c => c.data));

    return this;
  }
}

export interface InteractionHandlerOptions {
  automateCategories?: boolean;
  classToHandle?: Function;
  directory?: string;
  extensions?: string[] | Set<string>;
  loadFilter?: LoadPredicate;
}