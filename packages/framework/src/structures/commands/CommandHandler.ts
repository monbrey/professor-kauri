import type { CommandInteraction, Message } from "discord.js";
import type { Command } from "./Command";
import type { KauriClient } from "../../client/KauriClient";
import { KauriHandler, KauriHandlerOptions } from "../KauriHandler";

export class CommandHandler extends KauriHandler<Command> {
  constructor(client: KauriClient, options: KauriHandlerOptions) {
    super(client, options);

    this.setup();
  }

  private setup(): void {
    this.client.once("ready", async () => {
      await this.fetch();

      this.client.on("interaction", i => {
        if (i.isCommand()) this.handle(i);
      });
    });
  }

  private async handle(interaction: CommandInteraction): Promise<void | Message | unknown> {
    if (!interaction.module) {
      return interaction.reply({ content: `\`${interaction.commandName}\` is not yet implemented!`, ephemeral: true });
    }

    try {
      return await interaction.module.exec(interaction);
    } catch (err) {
      console.log(err);
      // this.client.logger.error(err);
      const method: keyof typeof interaction = interaction.replied ? "editReply" : "reply";
      return interaction[method]({
        content: `[${interaction.commandName}] ${err.message}`,
        ephemeral: true,
        code: true,
      });
    }
  }

  public async fetch({ global = true, guild = true } = {}): Promise<this> {
    if (global && this.client.application) await this.client.application.commands.fetch();
    if (guild) await Promise.all(this.client.guilds.cache.map(g => g.commands.fetch()));

    return this;
  }

  public async deploy({ global = true, guild = true } = {}): Promise<this> {
    // eslint-disable-next-line max-len
    const [guildCommands, globalcommands] = this.modules.partition((m: Command) => m.guild || Boolean(m.guilds.length));

    if (global && this.client.application) {
      await this.client.application.commands.set(globalcommands.array());
    }

    if (guild) {
      await Promise.all(
        this.client.guilds.cache.map((g, id) => {
          const commands = [...guildCommands.filter(c =>
            c.guild && (c.guilds.length === 0 || c.guilds.includes(id))
          ).values()];
          return g.commands.set(commands);
        })
      );
    }

    return this;
  }
}
