import { Structures } from "discord.js";
import type { Command } from "./commands/Command";
import type { KauriClient } from "../client/KauriClient";

declare module "discord.js" {
  interface CommandInteraction {
    readonly module: Command | null;
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
Structures.extend("CommandInteraction", CommandInteraction => class extends CommandInteraction {
  public client!: KauriClient;

  public get module(): Command | null {
    return this.client.commands.modules.get(this.commandName) ?? null;
  }
});
