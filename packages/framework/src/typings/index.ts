import type { CommandData } from "../structures/commands/Command";

export type Module<T> = {
  default: new (...args: any[]) => T;
  data: CommandData;
};

export type Extended<T> = { prototype: any } & T;
