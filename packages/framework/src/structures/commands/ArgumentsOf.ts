import type { Models } from "@professor-kauri/framework";
import type { Channel } from "diagnostic_channel";
import type { GuildMember, Permissions, Role, User } from "discord.js";

type ReadonlyCommand = Readonly<{
  name: string;
  description: string;
  options?: readonly Option[];
}>;

type Option = Readonly<
{
  name: string;
  description: string;
  required?: boolean;
} & (
  | {
    type: "SUB_COMMAND" | "SUB_COMMAND_GROUP";
    options?: readonly Option[];
  }
  | {
    type: "STRING";
    choices?: ReadonlyArray<Readonly<{ name: string; value: string }>>;
    augmentTo?: keyof typeof Models;
  }
  | {
    type: "INTEGER";
    choices?: ReadonlyArray<Readonly<{ name: string; value: number }>>;
  }
  | {
    type: "BOOLEAN" | "USER" | "CHANNEL" | "ROLE";
  }
)
>;

type Simplify<T> = T extends unknown ? { [K in keyof T]: Simplify<T[K]> } : T;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type TypeIdToType<T, O, C, A = never> = T extends "SUB_COMMAND"
  ? ArgumentsOfRaw<O>
  : T extends "SUB_COMMAND_GROUP"
    ? ArgumentsOfRaw<O>
    : T extends "STRING"
      ? C extends ReadonlyArray<{ value: string }>
        ? C[number]["value"]
        : A extends never
          ? never
          : A
      : T extends "INTEGER"
        ? C extends ReadonlyArray<{ value: number }>
          ? C[number]["value"]
          : number
        : T extends "BOOLEAN"
          ? boolean
          : T extends "USER"
            ? GuildMember & { user: User; permissions: Permissions }
            : T extends "CHANNEL"
              ? Channel & { permissions: Permissions }
              : T extends "ROLE"
                ? Role
                : never;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type OptionToObject<O> = O extends {
  name: infer K;
  type: infer T;
  required?: infer R;
  augmentTo?: infer A;
  // eslint-disable-next-line @typescript-eslint/no-shadow
  options?: infer O;
  choices?: infer C;
}
  ? K extends string
    ? R extends true
      ? { [k in K]: TypeIdToType<T, O, C, A> }
      : T extends "SUB_COMMAND" | "SUB_COMMAND_GROUP" | "BOOLEAN"
        ? { [k in K]: TypeIdToType<T, O, C, A> }
        : { [k in K]?: TypeIdToType<T, O, C, A> }
    : never
  : never;

type ArgumentsOfRaw<O> = O extends readonly any[] ? UnionToIntersection<OptionToObject<O[number]>> : never;

export type ArgumentsOf<C extends ReadonlyCommand> = C extends { options: readonly Option[] }
  ? Simplify<UnionToIntersection<OptionToObject<C["options"][number]>>>
  : unknown;
