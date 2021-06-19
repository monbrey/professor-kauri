import { Snowflake, Structures } from 'discord.js';
import { IStarboardConfigDocument } from '../../models/schemas/starboardConfig';
import { KauriClient } from '../KauriClient';

declare module 'discord.js' {
  interface Guild {
    client: KauriClient;
    starboard: IStarboardConfigDocument | null;
    logChannel: Snowflake | null;
  }
}

Structures.extend('Guild', Guild => {
  class KauriGuild extends Guild {
    public get starboard(): IStarboardConfigDocument | null {
      return this.client.settings?.get(this.id)?.starboard ?? null;
    }

    public get logChannel(): Snowflake | null {
      return this.client.settings?.get(this.id)?.logs ?? null;
    }
  }

  return KauriGuild;
});
