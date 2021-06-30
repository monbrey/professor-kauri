import type { CommandInteraction, Message, Snowflake } from "discord.js";
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

      this.client.on("interaction", async i => {
        if (i.isCommand()) {
          // await i.augmentOptions();
          this.handle(i);
        }
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
      console.error(err);
      // this.client.logger.error(err);
      const method: keyof typeof interaction = interaction.replied ? "editReply" : "reply";
      return interaction[method]({
        content: `[${interaction.commandName}] ${err.message}`,
        ephemeral: true,
      });
    }
  }

  public async fetch({ global = true, guild = true } = {}): Promise<this> {
    if (global) await this.client.application?.commands.fetch();
    if (guild) {
      const guildId = (process.env.GUILD ?? "135864828240592896") as Snowflake;
      if (!guildId) throw new Error("No guild");
      await this.client.guilds.cache.get(guildId)?.commands.fetch();
    }

    return this;
  }

  public async deploy({ global = true, guild = true } = {}): Promise<this> {
    // eslint-disable-next-line max-len
    const [guildCommands, globalcommands] = this.modules.partition(m => m.guild);

    if (global) await this.client.application?.commands.set(globalcommands.array());

    if (guild) {
      const guildId = (process.env.GUILD ?? "135864828240592896") as Snowflake;
      if (!guildId) throw new Error("No guild");
      await this.client.guilds.cache.get(guildId)?.commands.set(guildCommands.array());
    }

    return this;
  }
}
