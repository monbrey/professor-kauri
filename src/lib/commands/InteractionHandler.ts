import { resolve } from 'path';
import { AkairoHandler, LoadPredicate } from 'discord-akairo';
import { APIMessage } from 'discord-api-types';
import { Collection, CommandInteraction, CommandInteractionOption, Message, Snowflake } from 'discord.js';
import { KauriSlashCommand } from './KauriSlashCommand';
import { KauriClient } from '../KauriClient';
import { CommandExecutionError } from '../misc/CommandExecutionError';

export class InteractionHandler extends AkairoHandler {
  public modules: Collection<string, KauriSlashCommand>;

  public client!: KauriClient;

  constructor(
    client: KauriClient,
    {
      directory,
      classToHandle = KauriSlashCommand,
      extensions = ['.js', '.ts'],
      automateCategories,
      loadFilter,
    }: InteractionHandlerOptions = {},
  ) {
    super(client, {
      directory,
      classToHandle,
      extensions,
      automateCategories,
      loadFilter,
    });

    this.modules = new Collection();
    this.setup();
  }

  setup(): void {
    this.client.once('ready', async () => {
      await this.fetchAll();

      this.client.on('interaction', i => {
        if (i.isCommand()) this.handle(i);
      });
    });
  }

  private argMapper(options: readonly CommandInteractionOption[]): Record<string, unknown> {
    const args: Record<string, unknown> = {};
    for (const value of options) {
      switch (value.type) {
        case 'SUB_COMMAND':
        case 'SUB_COMMAND_GROUP':
          args.subcommand = { name: value.name, options: value.options ? this.argMapper(value.options) : {} };
          break;
        case 'USER':
          args[value.name] = value.member ?? value.user ?? value.value;
          break;
        case 'CHANNEL':
          args[value.name] = value.channel ?? value.value;
          break;
        case 'ROLE':
          args[value.name] = value.role ?? value.value;
          break;
        default:
          args[value.name] = value.value ?? (value.type === 'BOOLEAN' ? false : null);
      }
    }

    return args;
  }

  async handle(interaction: CommandInteraction): Promise<void | Message | APIMessage> {
    const command = this.findCommand(interaction.commandName);

    if (!command) {
      return interaction.reply({ content: `\`${interaction.commandName}\` is not yet implemented!`, ephemeral: true });
    }

    // If (command.ownerOnly && interaction.user.id !== "122157285790187530")
    //   return interaction.reply(`\`${interaction.commandName}\` usage is restricted`, { ephemeral: true });

    try {
      const args = this.argMapper(interaction.options.data ?? []);
      return await command.exec(interaction, args);
    } catch (err) {
      console.log(err);
      this.client.logger.error(err);
      const method: keyof typeof interaction = interaction.replied ? 'reply' : 'editReply';
      await interaction[method]({
        content: `[${interaction.commandName}] ${err.message}`,
        ephemeral: true
      });
			return;
    }
  }

  public findCommand(name: string): KauriSlashCommand {
    return this.modules.get(name) as KauriSlashCommand;
  }

  loadAll(directory = this.directory, filter = this.loadFilter || ((): boolean => true)): this {
    const filepaths = AkairoHandler.readdirRecursive(directory);
    for (let filepath of filepaths) {
      filepath = resolve(filepath);
      if (filter(filepath)) this.load(filepath);
    }

    return this;
  }

  async fetchAll({ global = true, guild = true } = {}): Promise<this> {
    if (global && this.client.application) {
      const globals = await this.client.application.commands.fetch();
      this.modules
        .filter(m => !m.guild)
        .forEach(m => {
          const command = globals.find(g => g.name === m.name);
          if (!command) {
            this.client.logger.warn(`[InteractionHandler] Interaction '${m.name}' has not been pushed to Discord`);
          }
          m.command = command;
          if (command) globals.delete(command.id);
        });

      if (globals.size !== 0) {
        this.client.logger.warn(
          `[InteractionHandler] Unmapped global interactions found: ${globals.map(g => g.name).join(', ')}`,
        );
      }
    }

    if (guild && process.env.KAURI_GUILD) {
      const kauriGuild = this.client.guilds.resolve(process.env.KAURI_GUILD as Snowflake);
      if (!kauriGuild) throw new CommandExecutionError('[KauriInteractionHandler]: Unable to resolve configured guild');

      const guilds = await kauriGuild.commands.fetch();
      this.modules
        .filter(m => m.guild)
        .forEach(m => {
          const command = guilds.find(g => g.name === m.name);
          if (!command) {
            this.client.logger.warn(`[InteractionHandler] Interaction '${m.name}' has not been pushed to Discord`);
          }
          m.command = command;
          if (command) guilds.delete(command.id);
        });

      if (guilds.size !== 0) {
        this.client.logger.warn(
          `[InteractionHandler] Unmapped guild interactions found: ${guilds.map(g => g.name).join(', ')}`,
        );
      }
    }

    return this;
  }

  async setAll({ global = true, guild = true } = {}): Promise<this> {
    const [_globals, _guilds] = this.modules.partition((m: KauriSlashCommand) => !m.guild);

    if (global && this.client.application) {
      const globals = await this.client.application.commands.set([..._globals.values()]);
      for (const [, command] of globals) {
        const interaction = _globals.find(g => g.name === command.name);
        if (interaction) interaction.command = command;
      }
    }

    if (guild && process.env.KAURI_GUILD) {
      const kauriGuild = this.client.guilds.resolve(process.env.KAURI_GUILD as Snowflake);
      if (!kauriGuild) throw new CommandExecutionError('[KauriInteractionHandler]: Unable to resolve configured guild');

      const guilds = await kauriGuild.commands.set([..._guilds.values()]);
      for (const [, command] of guilds) {
        const interaction = _guilds.find(g => g.name === command.name);
        if (interaction) interaction.command = command;
      }
    }

    return this;
  }

  async setAllPermissions(): Promise<this> {
    const guilds = this.modules.filter((m: KauriSlashCommand) => m.guild);
    await Promise.all(guilds.map(command => command.updatePermissions()));
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
