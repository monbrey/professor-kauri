import type { Command, KauriClient } from "@professor-kauri/framework";
import { Structures } from "discord.js";

declare module "discord.js" {
  interface CommandInteraction {
    readonly module: Command | null;
    args: any;
    augmentOptions(): Promise<void>;
  }

  interface CommandInteractionOption {
    augmentedValue: any;
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
Structures.extend("CommandInteraction", CommandInteraction => class extends CommandInteraction {
  public client!: KauriClient;
  public args: any;

  // public async augmentOption(): Promise<void> {
  //   const baseOptions = this.module?.options;
  //   if (!baseOptions) return;

  //   console.log(baseOptions);

  //   for (const [name, option] of this.options) {
  //     const base = baseOptions.find(b => b.name === name);
  //     if (!base || !base.augmentedType) continue;

  //     Factory.create<typeof base["augmentedType"]>(base.augmentedType, { data: "something" });
  //     const augment = await base.augmentedType.fetch<base.augmentedType>(this.client, `${option.value}`);

  //     option.augmentedValue = augment;
  //   }
  // }

  public get module(): Command | null {
    return this.client.commands.modules.get(this.commandName) ?? null;
  }
});
